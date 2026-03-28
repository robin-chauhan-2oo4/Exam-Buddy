import StudyPlan from "../models/StudyPlan.js";
import PDF from "../models/PDF.js";
import { getAiClient, modelName, fallbackModel, rotateApiKey, getTotalKeys } from "../config/gemini.js";
import { awardXP } from "./gamification.controller.js";

// Helper for AI robust text extraction
const getText = (response) => {
  try {
    if (!response) return "";
    if (typeof response.text === "function") return response.text();
    if (response.response && typeof response.response.text === "function") return response.response.text();
    const candidates = response.candidates || response.response?.candidates;
    if (candidates?.[0]?.content?.parts?.[0]?.text) {
      return candidates[0].content.parts[0].text;
    }
    return "";
  } catch (error) {
    return "";
  }
};

// Helper for AI JSON parsing
const parseJSON = (text) => {
  if (!text) return [];
  try {
    let cleaned = text.replace(/```json|```/g, "").trim();
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]") + 1;
    if (start === -1 || end === 0) return [];
    let jsonContent = cleaned.slice(start, end);
    jsonContent = jsonContent.replace(/,\s*([\]}])/g, "$1");
    return JSON.parse(jsonContent);
  } catch (err) {
    console.error("JSON Parse Error:", err);
    return [];
  }
};

// Helper: call Gemini with retry, key rotation, and fallback model
const callGeminiWithRetry = async (prompt, systemInstruction) => {
  const totalKeys = getTotalKeys();
  const modelsToTry = [modelName, fallbackModel];

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt <= totalKeys; attempt++) {
      try {
        const aiClient = getAiClient();
        // console.log(`[StudyPlan] Trying model=${model}, key attempt ${attempt + 1}/${totalKeys + 1}`);
        const response = await aiClient.models.generateContent({
          model,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: { systemInstruction },
        });
        return response; // Success
      } catch (err) {
        const status = err.status || err.httpStatusCode || 0;
        console.warn(`[StudyPlan] Attempt failed: model=${model}, status=${status}, msg=${err.message?.slice(0, 120)}`);

        if ((status === 503 || status === 429) && attempt < totalKeys) {
          const rotated = rotateApiKey();
          if (rotated) {
            // console.log(`[StudyPlan] Rotated to next API key, retrying...`);
            continue;
          }
        }
        // If we've exhausted keys for this model, break and try the fallback model
        break;
      }
    }
  }

  throw new Error("All Gemini API keys and models are currently unavailable. Please try again later.");
};

/**
 * POST /api/study-plan/generate
 * Generates an AI study plan based on given PDFs and exam date.
 */
export const generateStudyPlan = async (req, res) => {
  try {
    const { title, examDate, pdfIds } = req.body;

    if (!title || !examDate || !pdfIds || pdfIds.length === 0) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Fetch PDFs context
    const pdfs = await PDF.find({ _id: { $in: pdfIds }, user: req.user.id });
    if (!pdfs.length) return res.status(404).json({ message: "No PDFs found" });

    // We only send a slice of text from each PDF to avoid token limits
    let accumulatedContext = "";
    pdfs.forEach((doc, idx) => {
      accumulatedContext += `\n--- SOURCE MATERIAL ${idx + 1}: ${doc.originalName || doc.filename} ---\n`;
      accumulatedContext += (doc.extractedText?.slice(0, 15000) || "") + "\n";
    });

    const prompt = `
You are an expert AI Study Planner. 
The user is preparing for an exam on: ${examDate}
The current date is: ${new Date().toISOString().substring(0, 10)}

TASK:
Create a multi-day structured study schedule leading up to the exam date, breaking down the provided source material into actionable daily goals. Wait, ensure the schedule spans a realistic timeframe (e.g. 5-14 days depending on how far the exam is).

RULES:
- Return ONLY a valid JSON array of Day objects.
- NO markdown formatting outside the JSON array, no extra text.
- Each date MUST be in "YYYY-MM-DD" format.
- Generate at least 1-3 tasks per day.

EXPECTED JSON SCHEMA:
[
  {
    "date": "YYYY-MM-DD",
    "tasks": [
      {
        "title": "Short actionable title",
        "description": "More context on what to read or practice"
      }
    ]
  }
]

SOURCE MATERIAL:
${accumulatedContext}
`;

    // Make AI Call with retry & rotation
    const response = await callGeminiWithRetry(prompt, "You are an expert tutor. ALWAYS return valid JSON arrays.");
    
    const rawText = getText(response);
    // console.log("[StudyPlan] Raw AI Text Output:", rawText);

    const schedule = parseJSON(rawText);

    if (!schedule || schedule.length === 0) {
      return res.status(422).json({ message: "AI failed to generate a valid study plan." });
    }

    // Save to DB
    const studyPlan = await StudyPlan.create({
      user: req.user.id,
      title,
      examDate,
      documents: pdfIds,
      schedule, // Assumes AI successfully mapped internal tasks schema
    });

    res.status(201).json({ plan: studyPlan, message: "Study plan created successfully!" });
  } catch (error) {
    console.error("Generate Study Plan Error:", error);
    
    // Return user-friendly message for API exhaustion
    if (error.message?.includes("unavailable") || error.message?.includes("All Gemini")) {
      return res.status(503).json({ message: "AI service is temporarily overloaded. Please wait a moment and try again." });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/study-plan
 * Get all study plans for the logged-in user
 */
export const getStudyPlans = async (req, res) => {
  try {
    const plans = await StudyPlan.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ plans });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch study plans" });
  }
};

/**
 * GET /api/study-plan/:id
 * Get a specific study plan and populate documents
 */
export const getStudyPlanById = async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ _id: req.params.id, user: req.user.id }).populate(
      "documents",
      "filename originalName"
    );
    if (!plan) return res.status(404).json({ message: "Study plan not found" });
    res.status(200).json({ plan });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch study plan" });
  }
};

/**
 * PUT /api/study-plan/:id/tasks/:taskId/complete
 * Mark a task in a specific day as completed
 */
export const markTaskComplete = async (req, res) => {
  try {
    const { id, taskId } = req.params;

    // We need to find the plan, locate the task nested inside `schedule`, and update it.
    // Simplest approach: Load the entire doc, mutate it, and save.
    const plan = await StudyPlan.findOne({ _id: id, user: req.user.id });
    if (!plan) return res.status(404).json({ message: "Study plan not found" });

    let taskFound = false;
    let alreadyCompleted = false;

    for (const day of plan.schedule) {
      for (const t of day.tasks) {
        if (t._id.toString() === taskId) {
          if (t.isCompleted) {
            alreadyCompleted = true;
          } else {
            t.isCompleted = true;
          }
          taskFound = true;
          break;
        }
      }
      if (taskFound) break;
    }

    if (!taskFound) return res.status(404).json({ message: "Task not found in plan" });
    if (alreadyCompleted) return res.status(400).json({ message: "Task already completed" });

    await plan.save();

    // Gamification Reward: 15 XP for completing a planned task
    const gamificationResult = await awardXP(req.user.id, 15);

    res.status(200).json({ 
      message: "Task completed", 
      plan, 
      gamification: gamificationResult 
    });
  } catch (error) {
    console.error("Mark Task Complete Error:", error);
    res.status(500).json({ message: "Failed to update task" });
  }
};

/**
 * DELETE /api/study-plan/:id
 * Delete a study plan
 */
export const deleteStudyPlan = async (req, res) => {
  try {
    const plan = await StudyPlan.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!plan) return res.status(404).json({ message: "Study plan not found" });
    res.status(200).json({ message: "Study plan deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete plan" });
  }
};

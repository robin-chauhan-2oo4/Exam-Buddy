// import PDF from "../models/PDF.js";
// import { aiClient, modelName } from "../config/gemini.js";
// import AIHistory from "../models/History.js";

// // --- 1. HELPER: Robust Text Extractor ---
// // Handles various response formats from different Gemini SDK versions
// const getText = (response) => {
//   try {
//     if (!response) return "";
//     // Check for response.text() function (standard SDK)
//     if (typeof response.text === 'function') return response.text();
//     if (response.response && typeof response.response.text === 'function') return response.response.text();
//     // Manual extraction from candidates
//     const candidates = response.candidates || response.response?.candidates;
//     if (candidates?.[0]?.content?.parts?.[0]?.text) {
//       return candidates[0].content.parts[0].text;
//     }
//     return "";
//   } catch (error) {
//     console.error("Text Extraction Error:", error);
//     return "";
//   }
// };

// // --- 2. HELPER: Robust JSON Parser ---
// // Fixed to handle trailing commas and markdown code blocks effectively
// const parseJSON = (text) => {
//   if (!text) return [];
//   try {
//     // 1. Strip markdown tags
//     let cleaned = text.replace(/```json|```/g, "").trim();

//     // 2. Locate the array structure
//     const start = cleaned.indexOf("[");
//     const end = cleaned.lastIndexOf("]") + 1;
//     if (start === -1 || end === 0) return [];

//     let jsonContent = cleaned.slice(start, end);

//     // 3. FIX TRAILING COMMAS: Removes commas before closing brackets/braces
//     // e.g., [1, 2,] -> [1, 2]
//     jsonContent = jsonContent.replace(/,\s*([\]}])/g, "$1");

//     return JSON.parse(jsonContent);
//   } catch (err) {
//     console.error("JSON Parse Error. Raw string was:", text);
//     return [];
//   }
// };

// // --- 3. HELPER: Smart Generation (Primary + Fallback) ---
// const generateSmart = async (userPrompt, systemPrompt) => {
//   const response = await aiClient.models.generateContent({
//     model: modelName,
//     contents: [
//       {
//         role: "user",
//         parts: [{ text: userPrompt }],
//       },
//     ],
//     config: {
//       systemInstruction: systemPrompt,
//     },
//   });

//   return response;
// };

// /* ==========================================
//    CONTROLLER FUNCTIONS
// ========================================== */

// export const generateSummary = async (req, res) => {
//   try {
//     const { pdfId } = req.body;
//     const pdf = await PDF.findById(pdfId);
//     if (!pdf) return res.status(404).json({ message: "PDF not found" });

//     const text = pdf.extractedText?.slice(0, 25000) || "";
//     const prompt = `Provide a comprehensive, exam-ready summary of this material. Use headings and detailed bullet points for key concepts.\n\nContent:\n${text}`;

//     const response = await generateSmart(prompt, "You are an expert academic tutor. Focus on clarity and depth.");
//     const summary = getText(response);

//     if (!summary) throw new Error("AI failed to generate summary text");

//     await AIHistory.create({ user: req.user.id, pdf: pdfId, type: "summary", output: summary });
//     res.status(200).json({ summary });
//   } catch (error) {
//     res.status(500).json({ message: "Summary failed", error: error.message });
//   }
// };

// export const generateFlashcards = async (req, res) => {
//   try {
//     const { pdfId } = req.body;
//     const pdf = await PDF.findById(pdfId);
//     if (!pdf) return res.status(404).json({ message: "PDF not found" });

//     const text = pdf.extractedText?.slice(0, 20000) || "";
//     const prompt = `Create 8-12 challenging flashcards.\n\nContent:\n${text}`;
//     const system = "Return ONLY a JSON array. NO markdown. Format: [{'question': '...', 'answer': '...'}]";

//     const response = await generateSmart(prompt, system);
//     const flashcards = parseJSON(getText(response));

//     if (!flashcards.length) throw new Error("JSON Parsing failed for flashcards");

//     await AIHistory.create({ user: req.user.id, pdf: pdfId, type: "flashcards", output: flashcards });
//     res.status(200).json({ flashcards });
//   } catch (error) {
//     res.status(500).json({ message: "Flashcards failed", error: error.message });
//   }
// };

// export const generateQuiz = async (req, res) => {
//   try {
//     const { pdfId, count = 8 } = req.body;
//     const pdf = await PDF.findById(pdfId);
//     if (!pdf) return res.status(404).json({ message: "PDF not found" });

//     const text = pdf.extractedText?.slice(0, 20000) || "";

//     const prompt = `
// You are an exam question generator.

// TASK:
// Create exactly ${count} multiple-choice questions from the content below.

// RULES (VERY IMPORTANT):
// - Output MUST be a valid JSON array
// - Do NOT include explanations or text outside JSON
// - Do NOT use markdown
// - Do NOT include trailing commas
// - Each question MUST have exactly 4 options
// - "correctAnswer" MUST exactly match one option string

// FORMAT (STRICT):
// [
//   {
//     "question": "string",
//     "options": ["A", "B", "C", "D"],
//     "correctAnswer": "A"
//   }
// ]

// CONTENT:
// ${text}
// `;

//     const system = "You are a precise exam generator. Follow the format exactly.";

//     const response = await generateSmart(prompt, system);

//     const rawText = getText(response);
//     console.log("RAW QUIZ AI OUTPUT:\n", rawText);

//     const quiz = parseJSON(rawText);

//     if (!quiz.length) {
//       return res.status(422).json({
//         message: "AI could not generate a valid quiz. Please try again.",
//       });
//     }

//     await AIHistory.create({
//       user: req.user.id,
//       pdf: pdfId,
//       type: "quiz",
//       output: quiz,
//     });

//     res.status(200).json({ quiz });
//   } catch (error) {
//     console.error("Quiz generation failed:", error);
//     res.status(500).json({ message: "Quiz generation failed" });
//   }
// };

// export const chatWithPDF = async (req, res) => {
//   try {
//     const { pdfId, question } = req.body;
//     const pdf = await PDF.findById(pdfId);
//     if (!pdf) return res.status(404).json({ message: "PDF not found" });

//     const cleanContext = (pdf.extractedText || "")
//       .replace(/\n/g, " ")
//       .replace(/\s+/g, " ")
//       .slice(0, 25000);

//     const systemPrompt = `You are a flexible Study Assistant. Use the provided context to answer.
//       [DOCUMENT CONTEXT]: ${cleanContext}`;

//     const response = await generateSmart(question, systemPrompt);
//     const answer = getText(response);

//     // ✅ FIXED: Removed the extra space from "chat "
//     await AIHistory.create({
//       user: req.user.id,
//       pdf: pdfId,
//       type: "chat",
//       input: question,
//       output: answer
//     });

//     res.status(200).json({ answer });
//   } catch (error) {
//     console.error("Chat Error:", error);
//     res.status(500).json({ message: "Chat assistance unavailable." });
//   }
// };

// export const getChatHistory = async (req, res) => {
//   try {
//     const { pdfId } = req.params;

//     // Check if pdfId is valid before querying
//     if (!pdfId || pdfId === "undefined") {
//         return res.status(400).json({ message: "Invalid PDF ID" });
//     }

//     const history = await AIHistory.find({
//       user: req.user.id,
//       pdf: pdfId,
//       type: "chat"
//     }).sort({ createdAt: 1 });

//     console.log(`Successfully fetched ${history.length} records for PDF ${pdfId}`);
//     res.status(200).json({ history });
//   } catch (error) {
//     console.error("History retrieval error:", error);
//     res.status(500).json({ message: "Failed to load history" });
//   }
// };

// export const deleteChatHistory = async (req, res) => {
//   try {
//     const { historyId } = req.params;

//     // Ensure the record belongs to the logged-in user before deleting
//     const record = await AIHistory.findOneAndDelete({
//       _id: historyId,
//       user: req.user.id
//     });

//     if (!record) {
//       return res.status(404).json({ message: "History record not found" });
//     }

//     res.status(200).json({ message: "Chat deleted successfully" });
//   } catch (error) {
//     console.error("Delete Error:", error);
//     res.status(500).json({ message: "Failed to delete chat" });
//   }
// };

// export const askAnything = async (req, res) => {
//   try {
//     const { question } = req.body;
//     // Ensure you have a general system prompt here
//     const systemPrompt = "You are a helpful AI tutor. Answer clearly and accurately.";

//     // Call your smart generation helper
//     const response = await generateSmart(question, systemPrompt);
//     const answer = getText(response);

//     await AIHistory.create({
//       user: req.user.id,
//       type: "ama",
//       input: question,
//       output: answer
//     });

//     res.status(200).json({ answer });
//   } catch (error) {
//     console.error("AMA Logic Error:", error);
//     res.status(500).json({ message: "Gemini API failed or model error" });
//   }
// };

// // ✅ NEW: Get all past quizzes for a user (Global History)
// export const getAllQuizzes = async (req, res) => {
//   try {
//     // Find all records where type is "quiz" across all PDFs for this user
//     const quizzes = await AIHistory.find({
//       user: req.user.id,
//       type: "quiz"
//     })
//     .populate('pdf', 'filename') // Attach the PDF name so we know where it came from
//     .sort({ createdAt: -1 });

//     res.status(200).json({ quizzes: quizzes || [] });
//   } catch (error) {
//     console.error("Quiz History Error:", error);
//     res.status(500).json({ message: "Failed to load quiz history" });
//   }
// };

// // ✅ NEW: Get AMA History (General AI conversations)
// export const getAMAHistory = async (req, res) => {
//   try {
//     const history = await AIHistory.find({
//       user: req.user.id,
//       type: "ama"
//     }).sort({ createdAt: -1 });

//     res.status(200).json({ history: history || [] });
//   } catch (error) {
//     console.error("AMA History Error:", error);
//     res.status(500).json({ message: "Failed to load AMA history" });
//   }
// };

import PDF from "../models/PDF.js";
import AIHistory from "../models/History.js";
import { aiClient, modelName } from "../config/gemini.js";

/* ======================================================
   HELPERS
====================================================== */

/**
 * Safely extract text from Gemini response
 */
const getText = (response) => {
  try {
    if (!response) return "";
    if (typeof response.text === "function") return response.text();
    if (response.response?.text) return response.response.text();

    const candidates = response.candidates || response.response?.candidates;
    return candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch {
    return "";
  }
};

/**
 * Robust JSON parser for LLM outputs
 */
const parseJSON = (text) => {
  if (!text) return [];
  try {
    let cleaned = text.replace(/```json|```/g, "").trim();
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]") + 1;
    if (start === -1 || end === 0) return [];

    cleaned = cleaned.slice(start, end);
    cleaned = cleaned.replace(/,\s*([\]}])/g, "$1"); // remove trailing commas
    return JSON.parse(cleaned);
  } catch {
    return [];
  }
};

/**
 * Single, safe Gemini call
 */
const generateSmart = async (userPrompt, systemPrompt) => {
  try {
    return await aiClient.models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      config: {
        systemInstruction: systemPrompt,
      },
    });
  } catch (err) {
    if (err.status === 429) {
      throw new Error("RATE_LIMIT");
    }
    throw err;
  }
};

/* ======================================================
   SUMMARY
====================================================== */

export const generateSummary = async (req, res) => {
  try {
    const { pdfId } = req.body;
    const pdf = await PDF.findById(pdfId);
    if (!pdf) return res.status(404).json({ message: "PDF not found" });

    const text = pdf.extractedText?.slice(0, 25000) || "";

    const prompt = `
Create a detailed, exam-ready summary from the content below.
Use headings and bullet points. Avoid fluff.

CONTENT:
${text}
`;

    const response = await generateSmart(
      prompt,
      "You are an expert academic tutor.",
    );

    const summary = getText(response);
    if (!summary) {
      return res
        .status(422)
        .json({ message: "AI failed to generate summary." });
    }

    await AIHistory.create({
      user: req.user.id,
      pdf: pdfId,
      type: "summary",
      output: summary,
    });

    res.status(200).json({ summary });
  } catch (err) {
    console.error("Summary Error:", err);
    res.status(500).json({ message: "Summary generation failed." });
  }
};

/* ======================================================
   FLASHCARDS
====================================================== */

export const generateFlashcards = async (req, res) => {
  try {
    const { pdfId } = req.body;
    const pdf = await PDF.findById(pdfId);
    if (!pdf) return res.status(404).json({ message: "PDF not found" });

    const text = pdf.extractedText?.slice(0, 20000) || "";

    const prompt = `
Generate 8–12 high-quality flashcards from the content below.

STRICT FORMAT:
[
  { "question": "string", "answer": "string" }
]

CONTENT:
${text}
`;

    const response = await generateSmart(
      prompt,
      "Return ONLY valid JSON. No markdown.",
    );

    const flashcards = parseJSON(getText(response));
    if (!flashcards.length) {
      return res.status(422).json({
        message: "AI failed to generate valid flashcards.",
      });
    }

    await AIHistory.create({
      user: req.user.id,
      pdf: pdfId,
      type: "flashcards",
      output: flashcards,
    });

    res.status(200).json({ flashcards });
  } catch (err) {
    console.error("Flashcards Error:", err);
    res.status(500).json({ message: "Flashcards generation failed." });
  }
};

/* ======================================================
   QUIZ
====================================================== */

export const generateQuiz = async (req, res) => {
  try {
    const { pdfId, count = 8 } = req.body;
    const pdf = await PDF.findById(pdfId);
    if (!pdf) return res.status(404).json({ message: "PDF not found" });

    const text = pdf.extractedText?.slice(0, 20000) || "";

    const prompt = `
Create exactly ${count} MCQ questions.

RULES:
- Output MUST be valid JSON
- No markdown
- Exactly 4 options per question
- correctAnswer must match an option exactly

FORMAT:
[
  {
    "question": "string",
    "options": ["A","B","C","D"],
    "correctAnswer": "A"
  }
]

CONTENT:
${text}
`;

    const response = await generateSmart(
      prompt,
      "You are a precise exam generator.",
    );

    const quiz = parseJSON(getText(response));
    if (!quiz.length) {
      return res.status(422).json({
        message: "AI failed to generate a valid quiz. Please retry.",
      });
    }
    

    await AIHistory.create({
      user: req.user.id,
      pdf: pdfId,
      type: "quiz",
      output: quiz,
    });

    res.status(200).json({ quiz });
  } catch (err) {
    console.error("Quiz Error:", err);
    res.status(500).json({ message: "Quiz generation failed." });
    if (err.message === "RATE_LIMIT") {
      return res.status(429).json({
        message: "AI quota exceeded. Please try again in a few seconds.",
      });
    }
  }
};

/* ======================================================
   CHAT WITH PDF
====================================================== */

export const chatWithPDF = async (req, res) => {
  try {
    const { pdfId, question, sessionId } = req.body;
    const pdf = await PDF.findById(pdfId);
    if (!pdf) return res.status(404).json({ message: "PDF not found" });

    const context = pdf.extractedText?.replace(/\s+/g, " ").slice(0, 25000);

    const response = await generateSmart(
      question,
      `You are a helpful and intelligent study assistant. Use the following document extract as context for the user's questions, but feel free to use your own general knowledge to fully answer and elaborate if the document is missing details.
      
      [DOCUMENT CONTEXT]:
      ${context}`,
    );

    const answer = getText(response);

    await AIHistory.create({
      user: req.user.id,
      pdf: pdfId,
      type: "chat",
      sessionId: sessionId || null,
      input: question,
      output: answer,
    });

    res.status(200).json({ answer });
  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ message: "Chat failed." });
  }
};

/* ======================================================
   AMA (GLOBAL AI)
====================================================== */

export const askAnything = async (req, res) => {
  try {
    const { question, sessionId } = req.body;

    const response = await generateSmart(
      question,
      "You are a helpful AI tutor. Answer clearly and concisely.",
    );

    const answer = getText(response);

    await AIHistory.create({
      user: req.user.id,
      type: "ama",
      sessionId: sessionId || null,
      input: question,
      output: answer,
    });

    res.status(200).json({ answer });
  } catch (err) {
    console.error("AMA Error:", err);
    res.status(500).json({ message: "AMA failed." });
  }
};

/* ======================================================
   HISTORY
====================================================== */

export const getAMAHistory = async (req, res) => {
  try {
    const history = await AIHistory.find({
      user: req.user.id,
      type: "ama",
    }).sort({ createdAt: -1 });

    res.status(200).json({ history });
  } catch {
    res.status(500).json({ message: "Failed to load AMA history." });
  }
};

export const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await AIHistory.find({
      user: req.user.id,
      type: "quiz",
    })
      .populate("pdf", "filename")
      .sort({ createdAt: -1 });

    res.status(200).json({ quizzes });
  } catch {
    res.status(500).json({ message: "Failed to load quiz history." });
  }
};

export const deleteChatHistory = async (req, res) => {
  try {
    const { historyId } = req.params;

    if (!historyId) {
      return res.status(400).json({ message: "History ID is required" });
    }

    const deleted = await AIHistory.deleteMany({
      $or: [{ _id: historyId }, { sessionId: historyId }],
      user: req.user.id,
    });

    if (!deleted.deletedCount) {
      return res.status(404).json({
        message: "Chat history not found or not authorized",
      });
    }

    res.status(200).json({
      message: "Chat history deleted successfully",
      historyId,
    });
  } catch (error) {
    console.error("Delete Chat History Error:", error);
    res.status(500).json({ message: "Failed to delete chat history" });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const { pdfId } = req.params;

    if (!pdfId) {
      return res.status(400).json({ message: "PDF ID is required" });
    }

    const history = await AIHistory.find({
      user: req.user.id,
      pdf: pdfId,
      type: "chat",
    }).sort({ createdAt: 1 }); // oldest → newest (chat order)

    res.status(200).json({
      history: history || [],
    });
  } catch (error) {
    console.error("Get Chat History Error:", error);
    res.status(500).json({ message: "Failed to load chat history" });
  }
};

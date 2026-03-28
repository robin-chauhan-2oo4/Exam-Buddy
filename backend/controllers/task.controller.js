import Task from "../models/Task.js";
import { awardXP } from "./gamification.controller.js";

// Pool of daily system tasks that rotate
const SYSTEM_TASK_POOL = [
  "Review 5 flashcards",
  "Generate a summary for a document",
  "Take a quiz on any document",
  "Chat with a PDF and ask 3 questions",
  "Upload a new study document",
  "Create flashcards for a new topic",
  "Review all due flashcards",
  "Score 80%+ on a quiz",
  "Generate probable exam questions",
  "Summarize your hardest document",
  "Review flashcards you marked 'Again'",
  "Complete a full study session (30 min)",
  "Revisit a document you haven't opened in a week",
  "Share your notes with a friend",
  "Organize your study materials",
];

/**
 * Pick 5 random tasks from the pool, seeded by date for consistency
 */
function getDailySystemTasks(dateStr) {
  // Simple deterministic shuffle based on date string
  const seed = dateStr.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const shuffled = [...SYSTEM_TASK_POOL].sort((a, b) => {
    const ha = (a.length * seed + a.charCodeAt(0)) % 100;
    const hb = (b.length * seed + b.charCodeAt(0)) % 100;
    return ha - hb;
  });
  return shuffled.slice(0, 5);
}

/**
 * Ensure system tasks exist for today; create them if not
 */
async function ensureSystemTasks(userId) {
  const today = new Date().toISOString().substring(0, 10);

  const existing = await Task.find({
    user: userId,
    type: "system",
    generatedFor: today,
  });

  if (existing.length > 0) return existing;

  // Generate fresh system tasks for today
  const titles = getDailySystemTasks(today);
  const tasks = titles.map((title) => ({
    user: userId,
    title,
    type: "system",
    xpReward: 20,
    generatedFor: today,
    completed: false,
  }));

  return await Task.insertMany(tasks);
}

/**
 * GET /api/tasks - Fetch all tasks (system for today + all user tasks)
 */
export const getTasks = async (req, res) => {
  try {
    const today = new Date().toISOString().substring(0, 10);

    // Ensure system tasks exist
    await ensureSystemTasks(req.user.id);

    // Fetch today's system tasks + all uncompleted user tasks + recently completed
    const [systemTasks, userTasks] = await Promise.all([
      Task.find({ user: req.user.id, type: "system", generatedFor: today }).sort({ createdAt: 1 }),
      Task.find({ user: req.user.id, type: "user" }).sort({ completed: 1, createdAt: -1 }),
    ]);

    res.status(200).json({ systemTasks, userTasks });
  } catch (error) {
    console.error("Get Tasks Error:", error);
    res.status(500).json({ message: "Failed to load tasks" });
  }
};

/**
 * POST /api/tasks - Create a new user task
 */
export const createTask = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ message: "Task title is required" });
    }

    const task = await Task.create({
      user: req.user.id,
      title: title.trim(),
      type: "user",
      xpReward: 10,
    });

    res.status(201).json({ task });
  } catch (error) {
    console.error("Create Task Error:", error);
    res.status(500).json({ message: "Failed to create task" });
  }
};

/**
 * PUT /api/tasks/:taskId - Update a task (edit title)
 */
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;

    const task = await Task.findOne({ _id: taskId, user: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (title !== undefined) task.title = title.trim();
    await task.save();

    res.status(200).json({ task });
  } catch (error) {
    console.error("Update Task Error:", error);
    res.status(500).json({ message: "Failed to update task" });
  }
};

/**
 * PUT /api/tasks/:taskId/complete - Mark task as completed and award XP
 */
export const completeTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findOne({ _id: taskId, user: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.completed) return res.status(400).json({ message: "Task already completed" });

    task.completed = true;
    await task.save();

    // Award XP
    const gamificationResult = await awardXP(req.user.id, task.xpReward);

    res.status(200).json({
      task,
      xpAwarded: task.xpReward,
      gamification: gamificationResult,
    });
  } catch (error) {
    console.error("Complete Task Error:", error);
    res.status(500).json({ message: "Failed to complete task" });
  }
};

/**
 * DELETE /api/tasks/:taskId - Delete a user task
 */
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findOneAndDelete({
      _id: taskId,
      user: req.user.id,
      type: "user", // Can only delete user tasks
    });

    if (!task) return res.status(404).json({ message: "Task not found or cannot be deleted" });

    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    console.error("Delete Task Error:", error);
    res.status(500).json({ message: "Failed to delete task" });
  }
};

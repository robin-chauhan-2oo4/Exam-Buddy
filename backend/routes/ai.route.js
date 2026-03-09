import express from "express";
import { 
  generateSummary, 
  generateFlashcards, 
  generateQuiz, 
  chatWithPDF, 
  getChatHistory,
  deleteChatHistory,
  askAnything,
  getAMAHistory,
  getAllQuizzes,
} from "../controllers/ai.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// --- AI Generation Routes ---
router.post("/summary", authMiddleware, generateSummary);
router.post("/flashcards", authMiddleware, generateFlashcards);
router.post("/quiz", authMiddleware, generateQuiz);

// --- Chat Routes ---
router.post("/chat", authMiddleware, chatWithPDF);
router.get("/history/:pdfId", authMiddleware, getChatHistory);
router.delete("/history/:historyId", authMiddleware, deleteChatHistory);

router.get("/quizzes/all", authMiddleware, getAllQuizzes);

router.post("/ama", authMiddleware, askAnything);
router.get("/ama/history", authMiddleware, getAMAHistory);


export default router;
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
  generateProbableQuestions,
  getProbableQuestionsHistory,
  updateProbableQuestions,
  elaborateQuestion,
} from "../controllers/ai.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// --- AI Generation Routes ---
router.post("/summary", authMiddleware, generateSummary);
router.post("/flashcards", authMiddleware, generateFlashcards);
router.post("/quiz", authMiddleware, generateQuiz);
router.post("/probable-questions", authMiddleware, generateProbableQuestions);
router.get("/probable-questions/history/:pdfId", authMiddleware, getProbableQuestionsHistory);
router.put("/probable-questions", authMiddleware, updateProbableQuestions);
router.post("/probable-questions/elaborate", authMiddleware, elaborateQuestion);

// --- Chat Routes ---
router.post("/chat", authMiddleware, chatWithPDF);
router.get("/history/:pdfId", authMiddleware, getChatHistory);
router.delete("/history/:historyId", authMiddleware, deleteChatHistory);

router.get("/quizzes/all", authMiddleware, getAllQuizzes);

router.post("/ama", authMiddleware, askAnything);
router.get("/ama/history", authMiddleware, getAMAHistory);


export default router;
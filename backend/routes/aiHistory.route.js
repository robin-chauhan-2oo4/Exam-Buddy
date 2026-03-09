// routes/aiHistory.route.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getHistoryByPDF,
  getHistoryByType,
  saveQuizAttempt,
  getQuizReview,
} from "../controllers/aiHistory.controller.js";

const router = express.Router();

router.get("/pdf/:pdfId", authMiddleware, getHistoryByPDF);
router.get("/pdf/:pdfId/:type", authMiddleware, getHistoryByType);

router.post("/quiz/attempt", authMiddleware, saveQuizAttempt);
router.get("/quiz/review/:pdfId", authMiddleware, getQuizReview);

export default router;

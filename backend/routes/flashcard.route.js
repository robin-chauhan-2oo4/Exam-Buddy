import express from "express";
import { getFlashcards, reviewFlashcard } from "../controllers/flashcard.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:pdfId", authMiddleware, getFlashcards);
router.put("/:cardId/review", authMiddleware, reviewFlashcard);

export default router;

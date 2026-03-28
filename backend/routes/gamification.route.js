import express from "express";
import { getProgressStats, manualAwardXP } from "../controllers/gamification.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", authMiddleware, getProgressStats);
router.post("/award", authMiddleware, manualAwardXP);

export default router;

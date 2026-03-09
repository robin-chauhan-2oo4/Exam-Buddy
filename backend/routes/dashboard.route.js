import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getDashboardStats,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getDashboardStats);

export default router;

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  generateStudyPlan,
  getStudyPlans,
  getStudyPlanById,
  markTaskComplete,
  deleteStudyPlan,
} from "../controllers/studyplan.controller.js";

const router = express.Router();

router.use(authMiddleware); // Ensure user is authenticated

router.post("/generate", generateStudyPlan);
router.get("/", getStudyPlans);
router.get("/:id", getStudyPlanById);
router.put("/:id/tasks/:taskId/complete", markTaskComplete);
router.delete("/:id", deleteStudyPlan);

export default router;

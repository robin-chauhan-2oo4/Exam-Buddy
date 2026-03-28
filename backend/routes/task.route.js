import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getTasks,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
} from "../controllers/task.controller.js";

const router = express.Router();

router.use(authMiddleware); // Ensure user is authenticated

router.get("/", getTasks);
router.post("/", createTask);
router.put("/:taskId", updateTask);
router.put("/:taskId/complete", completeTask);
router.delete("/:taskId", deleteTask);

export default router;

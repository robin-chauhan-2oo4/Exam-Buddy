import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import pdfRoutes from "./routes/pdf.route.js";
import authRoutes from "./routes/auth.route.js";
import aiRoutes from "./routes/ai.route.js";
import aiHistoryRoutes from "./routes/aiHistory.route.js";
import dashboardRoutes from "./routes/dashboard.route.js";
import flashcardRoutes from "./routes/flashcard.route.js";
import gamificationRoutes from "./routes/gamification.route.js";
import taskRoutes from "./routes/task.route.js";
import studyPlanRoutes from "./routes/studyplan.route.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/history", aiHistoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/progress", gamificationRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/study-plan", studyPlanRoutes);


app.get("/", (req, res) => {
  res.send("Exambuddy API running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);

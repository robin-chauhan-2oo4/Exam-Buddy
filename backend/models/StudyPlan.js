import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
});

const DaySchema = new mongoose.Schema({
  date: { type: String, required: true }, // "YYYY-MM-DD"
  tasks: [TaskSchema],
});

const StudyPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    examDate: {
      type: String, // "YYYY-MM-DD"
      required: true,
    },
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PDF",
      },
    ],
    schedule: [DaySchema],
  },
  { timestamps: true }
);

export default mongoose.model("StudyPlan", StudyPlanSchema);

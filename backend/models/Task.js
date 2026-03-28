import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
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
    completed: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ["system", "user"],
      default: "user",
    },
    xpReward: {
      type: Number,
      default: 10, // 20 for system, 10 for user
    },
    // For system tasks: the date they were generated for
    generatedFor: {
      type: String, // "YYYY-MM-DD"
      default: "",
    },
  },
  { timestamps: true }
);

taskSchema.index({ user: 1, type: 1, generatedFor: 1 });

export default mongoose.model("Task", taskSchema);

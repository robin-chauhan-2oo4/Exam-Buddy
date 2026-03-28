import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: String, // "YYYY-MM-DD" local time string
      required: true,
    },
    xpGained: {
      type: Number,
      default: 0,
    },
    actions: {
      type: Number, // Total number of actions taken on this day
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound index to quickly find a user's log for a specific date
activityLogSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("ActivityLog", activityLogSchema);

import mongoose from "mongoose";

const AIHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pdf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PDF",
      required: false, // ✅ FIXED
    },
    type: {
      type: String,
      enum: [
        "summary",
        "flashcards",
        "quiz",
        "quiz_attempt",
        "chat",
        "ama",
      ],
      required: true,
    },
    input: String,
    output: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.model("AIHistory", AIHistorySchema);

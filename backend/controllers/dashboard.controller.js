import PDF from "../models/PDF.js";
import AIHistory from "../models/History.js";

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      totalDocuments,
      totalSummaries,
      totalFlashcards,
      totalQuizzes,
      recentActivity,
    ] = await Promise.all([
      PDF.countDocuments({ user: userId }),

      AIHistory.countDocuments({ user: userId, type: "summary" }),
      AIHistory.countDocuments({ user: userId, type: "flashcards" }),
      AIHistory.countDocuments({ user: userId, type: "quiz" }),

      AIHistory.find({ user: userId })
        .populate("pdf", "filename")
        .sort({ createdAt: -1 })
        .limit(5)
        .select("type pdf createdAt"),
    ]);

    res.json({
      stats: {
        totalDocuments,
        totalSummaries,
        totalFlashcards,
        totalQuizzes,
      },
      recentActivity,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Dashboard load failed" });
  }
};

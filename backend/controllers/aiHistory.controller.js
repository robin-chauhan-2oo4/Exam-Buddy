import AIHistory from "../models/History.js";

export const getHistoryByPDF = async (req, res) => {
  try {
    const { pdfId } = req.params;

    const history = await AIHistory.find({
      user: req.user.id,
      pdf: pdfId,
    })
      .sort({ createdAt: -1 });

    res.status(200).json({ history });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch AI history",
    });
  }
};

export const getHistoryByType = async (req, res) => {
  try {
    const { pdfId, type } = req.params;

    const history = await AIHistory.find({
      user: req.user.id,
      pdf: pdfId,
      type,
    })
      .sort({ createdAt: -1 });

    res.status(200).json({ history });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch AI history",
    });
  }
};


export const saveQuizAttempt = async (req, res) => {
  try {
    const { pdfId, score = 0, total = 0, answers } = req.body;

    if (!pdfId || !Array.isArray(answers)) {
      return res.status(400).json({
        message: "Invalid quiz attempt payload",
      });
    }

    const sanitizedAnswers = answers.map(ans => ({
      question: ans.question,
      options: ans.options,
      correctAnswer: ans.correctAnswer,
      selectedAnswer:
        ans.selectedAnswer === null || ans.selectedAnswer === undefined
          ? "Not Answered"
          : ans.selectedAnswer,
    }));

    const accuracy =
      total > 0 ? Math.round((score / total) * 100) : 0;

    const attempt = await AIHistory.create({
      user: req.user.id,
      pdf: pdfId,
      type: "quiz_attempt",
      output: {
        score,
        total,
        accuracy,
        answers: sanitizedAnswers,
      },
    });
    // console.log("QUIZ ATTEMPT BODY:", req.body);


    res.status(201).json({ attempt });
  } catch (err) {
    console.error("Save Quiz Attempt Error:", err);
    res.status(500).json({ message: "Failed to save quiz attempt" });
  }
};

// controllers/aiHistory.controller.js
export const getQuizReview = async (req, res) => {
  try {
    const { pdfId } = req.params;

    const quiz = await AIHistory.findOne({
      user: req.user.id,
      pdf: pdfId,
      type: "quiz",
    }).sort({ createdAt: -1 });

    const attempt = await AIHistory.findOne({
      user: req.user.id,
      pdf: pdfId,
      type: "quiz_attempt",
    }).sort({ createdAt: -1 });

    if (!quiz || !attempt) {
      return res.status(404).json({ message: "No quiz or attempt found" });
    }

    res.status(200).json({
      quiz: quiz.output,
      attempt: attempt.output,
    });
  } catch (err) {
    console.error("Quiz Review Error:", err);
    res.status(500).json({ message: "Failed to load quiz review" });
  }
};

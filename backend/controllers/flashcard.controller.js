import Flashcard from "../models/Flashcard.js";
import { awardXP } from "./gamification.controller.js";

// Get all flashcards for a specific PDF
export const getFlashcards = async (req, res) => {
  try {
    const { pdfId } = req.params;
    if (!pdfId) return res.status(400).json({ message: "PDF ID required" });

    const flashcards = await Flashcard.find({ user: req.user.id, pdf: pdfId }).sort({ createdAt: 1 });
    
    // Compute due cards dynamically
    const now = new Date();
    const dueCount = flashcards.filter(c => new Date(c.nextReviewDate) <= now).length;

    res.status(200).json({ flashcards, dueCount });
  } catch (error) {
    console.error("Get Flashcards Error:", error);
    res.status(500).json({ message: "Failed to load flashcards" });
  }
};

// Review a flashcard using Simplified SM-2 algorithm
export const reviewFlashcard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { quality } = req.body; // Quality: 0 (Again), 3 (Hard), 4 (Good), 5 (Easy)
    
    if (quality === undefined || quality < 0 || quality > 5) {
      return res.status(400).json({ message: "Review quality must be between 0 and 5" });
    }

    const card = await Flashcard.findOne({ _id: cardId, user: req.user.id });
    if (!card) return res.status(404).json({ message: "Card not found" });

    let { interval, easeFactor, repetitions } = card;

    if (quality >= 3) {
      // Correct response
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    } else {
      // Incorrect response ("Again")
      repetitions = 0;
      interval = 1;
    }

    // Update Ease Factor
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    card.interval = interval;
    card.easeFactor = easeFactor;
    card.repetitions = repetitions;
    // Set next review date by adding `interval` days to now
    card.nextReviewDate = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);

    await card.save();

    // Award XP for reviewing a flashcard!
    const gamificationResult = await awardXP(req.user.id, 5);

    res.status(200).json({ 
      card, 
      message: "Review recorded successfully",
      gamification: gamificationResult 
    });
  } catch (error) {
    console.error("Review Flashcard Error:", error);
    res.status(500).json({ message: "Failed to submit review" });
  }
};

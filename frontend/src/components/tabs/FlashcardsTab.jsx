import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shuffle,
  Sparkles,
  Loader2,
  BrainCircuit,
  Wand2,
  CalendarClock,
  CheckCircle2,
} from "lucide-react";
import {
  generateFlashcards,
  getFlashcardsHistory,
  reviewFlashcard,
} from "../../services/flashcards.api";
import Flashcard from "../Flashcard";
import SpotlightCard from "../reactbits/SpotlightCard";

export default function FlashcardsTab({ pdfId }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }
  const [reviewedIds, setReviewedIds] = useState(new Set()); // Track which cards were just reviewed
  const [activeDeck, setActiveDeck] = useState("Deck 1");

  useEffect(() => {
    loadFlashcards();
  }, [pdfId]);

  const loadFlashcards = async () => {
    setLoading(true);
    try {
      const res = await getFlashcardsHistory(pdfId);
      const allCards = res.data.flashcards || [];
      setCards(allCards);

      if (allCards.length > 0) {
        const decks = [...new Set(allCards.map(c => c.deckName || 'Deck 1'))];
        // If current activeDeck isn't strictly in this set (or just default latest), select the latest
        setActiveDeck(prev => decks.includes(prev) ? prev : decks[decks.length - 1]);
      }
    } catch (error) {
      console.error("Failed to load cards", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generateFlashcards(pdfId);
      await loadFlashcards();
    } catch (error) {
      alert("Failed to generate flashcards");
    } finally {
      setIsGenerating(false);
    }
  };

  const shuffleCards = () => {
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleReview = async (cardId, quality) => {
    const qualityLabels = { 0: "Again", 3: "Hard", 4: "Good", 5: "Easy" };
    try {
      const res = await reviewFlashcard(cardId, quality);

      if (res && res.data && res.data.card) {
        const updatedCard = res.data.card;
        setCards((prevCards) =>
          prevCards.map((c) => (c._id === cardId ? updatedCard : c))
        );

        // Mark this card as just-reviewed for visual glow
        setReviewedIds((prev) => new Set(prev).add(cardId));
        setTimeout(() => {
          setReviewedIds((prev) => {
            const next = new Set(prev);
            next.delete(cardId);
            return next;
          });
        }, 3000);

        // Show toast with next review info
        const nextDate = new Date(updatedCard.nextReviewDate);
        const daysUntil = Math.round(
          (nextDate - new Date()) / (1000 * 60 * 60 * 24)
        );
        const dateStr =
          daysUntil <= 0
            ? "later today"
            : daysUntil === 1
            ? "tomorrow"
            : `in ${daysUntil} days`;

        showToast(
          `✅ Marked as "${qualityLabels[quality]}" — next review ${dateStr}`,
          "success"
        );
      } else {
        showToast("⚠️ Review sent but no update received", "warning");
      }
    } catch (err) {
      console.error("Review Error:", err);
      showToast(
        `❌ Review failed: ${err.response?.data?.message || err.message}`,
        "error"
      );
    }
  };

  // Stats
  const now = new Date();
  const uniqueDecks = [...new Set(cards.map(c => c.deckName || 'Deck 1'))];
  const deckCards = cards.filter(c => (c.deckName || 'Deck 1') === activeDeck);
  
  const dueCards = deckCards.filter((c) => new Date(c.nextReviewDate) <= now);
  const masteredCount = deckCards.filter((c) => c.interval > 0).length;
  const progress = deckCards.length > 0 ? (masteredCount / deckCards.length) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="h-full flex flex-col relative"
    >
      {/* ──── Toast Notification ──── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -30, x: "-50%" }}
            transition={{ duration: 0.3 }}
            className="fixed top-6 left-1/2 z-[100] px-6 py-3 rounded-xl font-semibold text-sm shadow-2xl backdrop-blur-xl"
            style={{
              background:
                toast.type === "error"
                  ? "rgba(239, 68, 68, 0.9)"
                  : toast.type === "warning"
                  ? "rgba(245, 158, 11, 0.9)"
                  : "rgba(16, 185, 129, 0.85)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──── Header Section ──── */}
      <div
        className="rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h2
                className="text-xl font-bold flex items-center gap-2"
                style={{ color: "var(--text-primary)" }}
              >
                <BrainCircuit size={24} style={{ color: "var(--accent)" }} />
                Spaced Repetition Deck
              </h2>
              <div className="flex items-center gap-4">
                <span
                  className="text-sm font-semibold flex items-center gap-1.5"
                  style={{ color: "#f97316" }}
                >
                  <CalendarClock size={16} /> {dueCards.length} Due
                </span>
                <span
                  className="text-sm font-semibold flex items-center gap-1.5"
                  style={{ color: "#10b981" }}
                >
                  <CheckCircle2 size={16} /> {masteredCount} / {cards.length}{" "}
                  Learning
                </span>
              </div>
            </div>

            {/* Animated Progress Bar */}
            <div
              className="h-2.5 w-full rounded-full overflow-hidden"
              style={{ background: "var(--bg-input)" }}
            >
              <motion.div
                className="h-full rounded-full relative"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                  background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                  boxShadow:
                    progress > 0
                      ? "0 0 12px rgba(99, 102, 241, 0.4)"
                      : "none",
                }}
              >
                <div
                  className="absolute inset-0 bg-white/20"
                  style={{ animation: "shimmer 2s infinite linear" }}
                />
              </motion.div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={shuffleCards}
              disabled={cards.length === 0}
              whileHover={{ scale: 1.05, rotate: 10 }}
              whileTap={{ scale: 0.95, rotate: -10 }}
              className="flex items-center gap-2 px-4 py-2.5 font-medium rounded-xl transition-colors disabled:opacity-50"
              style={{
                background: "var(--bg-surface)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-color)",
              }}
            >
              <Shuffle size={18} />
              <span className="hidden sm:inline">Shuffle</span>
            </motion.button>

            <motion.button
              onClick={handleGenerate}
              disabled={isGenerating}
              whileHover={{
                scale: 1.04,
                y: -2,
                boxShadow: "0 12px 28px var(--accent-shadow)",
              }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-2xl transition-all disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden group"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 6px 20px var(--accent-shadow)",
              }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              {isGenerating ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Wand2 size={18} />
              )}
              <span className="relative z-10 hidden sm:inline">
                {isGenerating ? "Generating..." : "Generate New Deck"}
              </span>
              <span className="relative z-10 sm:hidden">
                {isGenerating ? "..." : "Generate"}
              </span>
            </motion.button>
          </div>
        </div>

        {/* ──── Deck Switcher ──── */}
        {uniqueDecks.length > 0 && (
          <div className="mt-5 pt-4 flex gap-2 overflow-x-auto pb-1 hide-scrollbar" style={{ borderTop: '1px solid var(--border-light)' }}>
            {uniqueDecks.map(deck => (
              <button
                key={deck}
                onClick={() => setActiveDeck(deck)}
                className="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all"
                style={{
                  background: activeDeck === deck ? 'var(--accent)' : 'var(--bg-surface)',
                  color: activeDeck === deck ? '#fff' : 'var(--text-secondary)',
                  border: activeDeck === deck ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                  boxShadow: activeDeck === deck ? '0 4px 12px var(--accent-shadow)' : 'none'
                }}
              >
                {deck}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ──── Cards Grid ──── */}
      <AnimatePresence mode="wait">
        {loading && cards.length === 0 ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="relative">
              <div
                className="w-16 h-16 border-4 rounded-full animate-spin"
                style={{
                  borderColor: "var(--accent)",
                  borderTopColor: "transparent",
                }}
              />
            </div>
            <p
              className="font-medium mt-4 animate-pulse"
              style={{ color: "var(--text-muted)" }}
            >
              Loading your deck...
            </p>
          </motion.div>
        ) : cards.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <SpotlightCard
              className="relative overflow-hidden"
              spotlightColor="rgba(245, 158, 11, 0.15)"
            >
              <div className="flex flex-col items-center justify-center py-20 text-center p-8 relative z-10">
                <motion.div
                  animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative mb-8"
                >
                  <div
                    className="absolute inset-0 rounded-full blur-xl opacity-40 animate-pulse"
                    style={{
                      background: "#f59e0b",
                      transform: "scale(1.5)",
                    }}
                  />
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center relative shadow-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #f59e0b, #fbbf24)",
                      boxShadow: "0 8px 32px rgba(245, 158, 11, 0.4)",
                    }}
                  >
                    <BrainCircuit size={36} className="text-white" />
                  </div>
                </motion.div>
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  No flashcards yet
                </h3>
                <p
                  className="max-w-sm leading-relaxed mb-8"
                  style={{ color: "var(--text-muted)" }}
                >
                  Generate a deck to start memorizing key concepts from your
                  document.
                </p>
                <motion.button
                  onClick={handleGenerate}
                  className="flex items-center gap-2 px-8 py-3.5 text-white rounded-2xl font-semibold"
                  style={{
                    background:
                      "linear-gradient(135deg, #f59e0b, #fbbf24)",
                    boxShadow: "0 8px 30px rgba(245, 158, 11, 0.4)",
                  }}
                >
                  <Sparkles size={18} /> Generate First Deck
                </motion.button>
              </div>
            </SpotlightCard>
          </motion.div>
        ) : deckCards.length === 0 ? (
          <motion.div
            key="empty-deck"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
             <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>No flashcards in this deck</h3>
             <p style={{ color: "var(--text-muted)" }}>This deck appears to be empty.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7 pb-8">
            {deckCards.map((card) => {
              const isDue = new Date(card.nextReviewDate) <= new Date();
              const daysUntil = Math.round(
                (new Date(card.nextReviewDate) - new Date()) /
                  (1000 * 60 * 60 * 24)
              );
              const nextReviewLabel =
                daysUntil <= 0
                  ? "Today"
                  : daysUntil === 1
                  ? "Tomorrow"
                  : `In ${daysUntil} days`;

              return (
                <div key={card._id} className="relative">
                  <Flashcard
                    front={card.front || card.question}
                    back={card.back || card.answer}
                    isDue={isDue}
                    nextReviewLabel={nextReviewLabel}
                    onReview={(quality) => handleReview(card._id, quality)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </motion.div>
  );
}

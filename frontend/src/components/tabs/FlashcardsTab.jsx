import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shuffle,
  Sparkles,
  Loader2,
  BrainCircuit,
  CheckCircle2,
  Wand2,
} from "lucide-react";
import {
  generateFlashcards,
  getFlashcardsHistory,
} from "../../services/flashcards.api";
import Flashcard from "../Flashcard";
import SpotlightCard from "../reactbits/SpotlightCard";

export default function FlashcardsTab({ pdfId }) {
  const [cards, setCards] = useState([]);
  const [known, setKnown] = useState({});
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadFlashcards();
  }, [pdfId]);

  const loadFlashcards = async () => {
    setLoading(true);
    try {
      const res = await getFlashcardsHistory(pdfId);
      if (res.data.history.length > 0) {
        setCards(res.data.history[0].output);
        setKnown({});
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

  const knownCount = Object.values(known).filter(Boolean).length;
  const progress = cards.length > 0 ? (knownCount / cards.length) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="h-full flex flex-col"
    >
      {/* Header Section */}
      <div
        className="rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <BrainCircuit size={24} style={{ color: 'var(--accent)' }} />
                Flashcards Deck
              </h2>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                {knownCount} / {cards.length} Mastered
              </span>
            </div>

            {/* Animated Progress Bar */}
            <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ background: 'var(--bg-input)' }}>
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                  background: 'linear-gradient(90deg, #10b981, #34d399)',
                  boxShadow: progress > 0 ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none',
                }}
              />
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
                background: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
              }}
            >
              <Shuffle size={18} />
              <span className="hidden sm:inline">Shuffle</span>
            </motion.button>

            <motion.button
              onClick={handleGenerate}
              disabled={isGenerating}
              whileHover={{ scale: 1.04, y: -2, boxShadow: '0 12px 28px var(--accent-shadow)' }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-2xl transition-all disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 6px 20px var(--accent-shadow)',
              }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
              <span className="relative z-10 hidden sm:inline">{isGenerating ? "Generating..." : "Generate New Deck"}</span>
              <span className="relative z-10 sm:hidden">{isGenerating ? "..." : "Generate"}</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="relative">
              <div className="w-16 h-16 border-4 rounded-full animate-spin"
                style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
              />
            </div>
            <p className="font-medium mt-4 animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading your deck...</p>
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
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative mb-8"
                >
                  <div className="absolute inset-0 rounded-full blur-xl opacity-40 animate-pulse"
                    style={{ background: '#f59e0b', transform: 'scale(1.5)' }}
                  />
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center relative shadow-xl"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                      boxShadow: '0 8px 32px rgba(245, 158, 11, 0.4)',
                    }}
                  >
                    <BrainCircuit size={36} className="text-white" />
                  </div>
                </motion.div>

                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                  No flashcards yet
                </h3>
                <p className="max-w-sm leading-relaxed mb-8" style={{ color: 'var(--text-muted)' }}>
                  Generate a deck to start memorizing key concepts from your document.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGenerate}
                  className="flex items-center gap-2 px-8 py-3.5 text-white rounded-2xl font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                    boxShadow: '0 8px 30px rgba(245, 158, 11, 0.4)',
                  }}
                >
                  <Sparkles size={18} />
                  Generate First Deck
                </motion.button>

                <div className="absolute top-6 right-8 opacity-[0.03]">
                  <BrainCircuit size={180} />
                </div>
              </div>
            </SpotlightCard>
          </motion.div>
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8"
          >
            {cards.map((card, index) => (
              <div key={index}>
                <Flashcard
                  front={card.question || card.front}
                  back={card.answer || card.back}
                  isKnown={known[index]}
                  onKnown={() => setKnown((k) => ({ ...k, [index]: true }))}
                  onUnknown={() => setKnown((k) => ({ ...k, [index]: false }))}
                />
              </div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

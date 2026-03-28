import { motion, AnimatePresence } from "framer-motion";
import { Star, TrendingUp, Award, X } from "lucide-react";
import { useEffect, useState } from "react";

// Fallback confetti if library not present, but we will assume we can use basic HTML/CSS or just skip complex confetti.
export default function LevelUpModal({ level, onClose }) {
  const [windowDimensions, setWindowDimensions] = useState({ width: 800, height: 600 });
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Confetti (Fake placeholder if react-confetti missing, or just styling) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center mt-20">
         {/* Simple CSS animation elements could go here, but omitted for simplicity */}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="relative w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl overflow-hidden"
        style={{
          background: "var(--bg-card)",
          border: "2px solid var(--accent)",
        }}
      >
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: "var(--accent)" }} />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full opacity-50 hover:opacity-100 transition-opacity"
          style={{ background: "var(--bg-surface)" }}
        >
          <X size={16} />
        </button>

        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 1, ease: "easeInOut", delay: 0.2 }}
          className="mx-auto w-24 h-24 mb-6 rounded-full flex items-center justify-center shadow-xl relative"
          style={{
            background: "linear-gradient(135deg, var(--accent-light), var(--accent))",
            color: "white"
          }}
        >
          <Award size={48} className="drop-shadow-lg" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-extrabold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Level Up!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-lg font-medium mb-8"
          style={{ color: "var(--text-muted)" }}
        >
          You reached <strong style={{ color: "var(--accent)" }}>Level {level}</strong>. Keep up the great work!
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={onClose}
          className="w-full py-3.5 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Awesome! <TrendingUp size={20} />
        </motion.button>
      </motion.div>
    </div>
  );
}

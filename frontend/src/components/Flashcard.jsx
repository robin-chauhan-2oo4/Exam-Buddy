import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, RotateCw } from "lucide-react";

export default function Flashcard({
  front,
  back,
  onKnown,
  onUnknown,
  isKnown,
}) {
  const [flipped, setFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleFlip = () => setFlipped(!flipped);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group w-full max-w-md mx-auto h-[240px] sm:h-[280px] cursor-pointer"
      style={{ perspective: "1200px" }}
      onClick={handleFlip}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{
          rotateY: flipped ? 180 : 0,
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{
          rotateY: { duration: 0.7, ease: [0.23, 1, 0.32, 1] },
          scale: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
        }}
      >
        {/* FRONT FACE */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl flex flex-col items-center justify-center p-8 text-center"
          style={{
            backfaceVisibility: "hidden",
            background: 'var(--bg-card)',
            border: `2px solid ${isHovered && !flipped ? 'var(--accent)' : 'var(--border-color)'}`,
            boxShadow: isHovered && !flipped
              ? '0 12px 40px var(--accent-shadow)'
              : 'var(--shadow-card)',
            transition: 'border-color 0.3s ease, box-shadow 0.4s ease',
          }}
        >
          {/* Gradient accent bar at top */}
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
            style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)' }}
          />

          {/* Subtle decorative pattern */}
          <div
            className="absolute inset-0 rounded-2xl opacity-[0.02]"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 30%, var(--accent) 1px, transparent 1px),
                                radial-gradient(circle at 80% 70%, var(--accent) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />

          <h3
            className="text-xl md:text-2xl font-semibold leading-relaxed relative z-10"
            style={{ color: 'var(--text-primary)' }}
          >
            {front}
          </h3>

          <motion.div
            animate={{ opacity: isHovered && !flipped ? 1 : 0, y: isHovered && !flipped ? 0 : 4 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-4 text-xs flex items-center gap-1.5"
            style={{ color: 'var(--text-muted)' }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <RotateCw size={12} />
            </motion.div>
            <span>Click to flip</span>
          </motion.div>
        </div>

        {/* BACK FACE */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl flex flex-col items-center justify-between p-6 text-center"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: 'var(--bg-surface)',
            border: '2px solid var(--border-color)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {/* Gradient accent bar at top */}
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
            style={{ background: 'linear-gradient(90deg, #10b981, #34d399, #6ee7b7)' }}
          />

          {/* Answer Content */}
          <div className="flex-1 flex items-center justify-center overflow-y-auto w-full custom-scrollbar pt-4">
            <p className="text-lg font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {back}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="w-full grid grid-cols-2 gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--border-light)' }}>
            <motion.button
              whileHover={{ scale: 1.06, y: -2, boxShadow: '0 6px 20px rgba(239, 68, 68, 0.2)' }}
              whileTap={{ scale: 0.94 }}
              onClick={(e) => {
                e.stopPropagation();
                onUnknown();
              }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold shadow-sm relative overflow-hidden"
              style={{
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                color: 'var(--danger-text)',
                transition: 'box-shadow 0.3s ease',
              }}
            >
              <X size={16} />
              Hard
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.06, y: -2, boxShadow: '0 6px 20px rgba(16, 185, 129, 0.25)' }}
              whileTap={{ scale: 0.94 }}
              onClick={(e) => {
                e.stopPropagation();
                onKnown();
              }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold shadow-sm relative overflow-hidden"
              style={{
                background: isKnown ? 'rgba(16, 185, 129, 0.2)' : 'var(--success-bg)',
                border: `1px solid ${isKnown ? '#10b981' : 'var(--success-text)'}`,
                color: 'var(--success-text)',
                boxShadow: isKnown ? '0 0 20px rgba(16, 185, 129, 0.25)' : 'none',
                transition: 'box-shadow 0.3s ease',
              }}
            >
              <Check size={16} />
              {isKnown ? "Mastered ✓" : "Easy"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

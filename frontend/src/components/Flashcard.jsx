import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, RotateCw, Clock, ThumbsUp, CalendarClock } from "lucide-react";

export default function Flashcard({ front, back, onReview, isDue, nextReviewLabel }) {
  const [flipped, setFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="w-full mx-auto select-none"
      style={{ minHeight: "320px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        {!flipped ? (
          /* ═══════ FRONT FACE ═══════ */
          <motion.div
            key="front"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="w-full rounded-2xl flex flex-col items-center justify-center p-6 sm:p-10 text-center cursor-pointer relative overflow-hidden"
            style={{
              minHeight: "320px",
              background: "var(--bg-card)",
              border: `2px solid ${isHovered ? "var(--accent)" : "var(--border-color)"}`,
              boxShadow: isHovered
                ? "0 12px 40px var(--accent-shadow)"
                : "var(--shadow-card)",
              transition: "border-color 0.3s ease, box-shadow 0.4s ease",
            }}
            onClick={() => setFlipped(true)}
          >
            {/* Accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl"
              style={{
                background: isDue
                  ? "linear-gradient(90deg, #f97316, #fb923c, #fbbf24)"
                  : "linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)",
              }}
            />

            <h3
              className="text-xl sm:text-2xl font-bold leading-relaxed"
              style={{ color: "var(--text-primary)" }}
            >
              {front}
            </h3>

            <div
              className="absolute bottom-5 text-xs flex items-center gap-2 font-semibold tracking-wider uppercase"
              style={{
                color: "var(--text-muted)",
                opacity: isHovered ? 1 : 0.5,
                transition: "opacity 0.2s",
              }}
            >
              <RotateCw size={13} />
              <span>Click to reveal answer</span>
            </div>
          </motion.div>
        ) : (
          /* ═══════ BACK FACE ═══════ */
          <motion.div
            key="back"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="w-full rounded-2xl flex flex-col p-5 sm:p-6 relative overflow-hidden"
            style={{
              minHeight: "320px",
              background: "var(--bg-surface)",
              border: "2px solid var(--border-color)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            {/* Green accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl"
              style={{ background: "linear-gradient(90deg, #10b981, #34d399, #6ee7b7)" }}
            />

            {/* Answer Content — tap to flip back */}
            <div
              className="flex-1 flex flex-col items-center justify-center overflow-y-auto w-full pt-3 mb-3 cursor-pointer"
              onClick={() => setFlipped(false)}
            >
              <p
                className="text-[10px] uppercase font-extrabold tracking-widest mb-3 opacity-40"
                style={{ color: "var(--text-muted)" }}
              >
                Q: {front}
              </p>
              <p
                className="text-base sm:text-lg font-medium leading-relaxed text-center"
                style={{ color: "var(--text-secondary)" }}
              >
                {back}
              </p>
              <p
                className="text-[10px] uppercase font-bold tracking-wider mt-4 opacity-30"
                style={{ color: "var(--text-muted)" }}
              >
                ↑ Tap answer to flip back
              </p>
            </div>

            {/* SRS Buttons — ONLY when card is due */}
            {isDue && (
              <div
                className="w-full flex gap-2 pt-3 shrink-0"
                style={{ borderTop: "1px solid var(--border-light)" }}
              >
                {[
                  { label: "Again", quality: 0, icon: X, bg: "var(--danger-bg)", color: "var(--danger-text)", border: "var(--danger-border)" },
                  { label: "Hard", quality: 3, icon: Clock, bg: "rgba(249,115,22,0.1)", color: "#f97316", border: "rgba(249,115,22,0.2)" },
                  { label: "Good", quality: 4, icon: ThumbsUp, bg: "var(--success-bg)", color: "var(--success-text)", border: "var(--success-border)" },
                  { label: "Easy", quality: 5, icon: Check, bg: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "rgba(59,130,246,0.2)" },
                ].map((btn) => {
                  const Icon = btn.icon;
                  return (
                    <button
                      key={btn.label}
                      type="button"
                      onClick={() => {
                        if (onReview) onReview(btn.quality);
                        setFlipped(false);
                      }}
                      className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer hover:brightness-110 active:scale-95 transition-all"
                      style={{
                        background: btn.bg,
                        color: btn.color,
                        border: `1px solid ${btn.border}`,
                      }}
                    >
                      <Icon size={16} style={{ pointerEvents: "none" }} />
                      {btn.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Next review info — when NOT due */}
            {!isDue && nextReviewLabel && (
              <div
                className="w-full flex items-center justify-center gap-2 pt-3 shrink-0"
                style={{ borderTop: "1px solid var(--border-light)" }}
              >
                <CalendarClock size={14} style={{ color: "#10b981" }} />
                <span className="text-xs font-semibold" style={{ color: "#10b981" }}>
                  Next review: {nextReviewLabel}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

export default function QuizQuestion({
  question,
  options,
  selected,
  correct,
  showReview,
  onSelect,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-3xl mx-auto"
    >
      {/* Question Text */}
      <h3 className="text-xl md:text-2xl font-bold mb-8 leading-relaxed"
        style={{ color: 'var(--text-primary)' }}
      >
        {question}
      </h3>

      {/* Options List */}
      <div className="space-y-3">
        {options.map((opt, i) => {
          const isSelected = selected === opt;
          const isCorrect = correct === opt;

          let borderColor = 'var(--border-color)';
          let bgColor = 'var(--bg-card)';
          let badgeBg = 'var(--bg-surface)';
          let badgeColor = 'var(--text-muted)';
          let textColor = 'var(--text-primary)';
          let shadow = 'none';

          if (showReview) {
            if (isCorrect) {
              borderColor = '#10b981';
              bgColor = 'rgba(16, 185, 129, 0.08)';
              badgeBg = '#10b981';
              badgeColor = '#fff';
              textColor = 'var(--text-primary)';
            } else if (isSelected && !isCorrect) {
              borderColor = '#ef4444';
              bgColor = 'rgba(239, 68, 68, 0.08)';
              badgeBg = '#ef4444';
              badgeColor = '#fff';
            } else {
              borderColor = 'var(--border-light)';
              bgColor = 'var(--bg-surface)';
            }
          } else if (isSelected) {
            borderColor = 'var(--accent)';
            bgColor = 'var(--accent-light)';
            badgeBg = 'var(--accent)';
            badgeColor = '#fff';
            shadow = '0 4px 16px var(--accent-shadow)';
          }

          return (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={!showReview ? { scale: 1.01, x: 4 } : {}}
              whileTap={!showReview ? { scale: 0.99 } : {}}
              disabled={showReview}
              onClick={() => onSelect(opt)}
              className="w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between"
              style={{
                borderColor,
                background: bgColor,
                boxShadow: shadow,
                cursor: showReview ? 'default' : 'pointer',
                opacity: showReview && !isCorrect && !isSelected ? 0.5 : 1,
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
                  style={{ background: badgeBg, color: badgeColor }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
                <span className="font-medium text-lg" style={{ color: textColor }}>
                  {opt}
                </span>
              </div>

              <div className="pl-4">
                {showReview ? (
                  isCorrect ? <CheckCircle2 style={{ color: '#10b981' }} /> :
                  (isSelected ? <XCircle style={{ color: '#ef4444' }} /> : null)
                ) : (
                  isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <CheckCircle2 size={22} style={{ color: 'var(--accent)' }} />
                    </motion.div>
                  )
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

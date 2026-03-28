import { motion } from "framer-motion";
import { X, Star, Zap, ChevronRight, Trophy } from "lucide-react";

export default function LevelProgressionModal({ isOpen, onClose, stats }) {
  if (!isOpen || !stats) return null;

  const { level, xp, progress } = stats;
  // Fallbacks if progress object is missing for any reason
  const fallbackXP = xp || 0;
  const currentLevel = level || 1;
  
  // Calculate raw formula for displaying next level milestone
  // Level N total XP = 25 * (N - 1) * (N + 2)
  const getXPForLevel = (l) => 25 * (l - 1) * (l + 2);
  const currentLvlXP = getXPForLevel(currentLevel);
  const nextLvlXP = getXPForLevel(currentLevel + 1);
  const totalXPNeeded = nextLvlXP - currentLvlXP;
  const currentProgressXP = fallbackXP - currentLvlXP;
  
  const pct = Math.min(Math.max((currentProgressXP / totalXPNeeded) * 100, 0), 100);

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

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Glow effect */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: "var(--accent)" }}
        />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--bg-surface)] transition-colors z-10"
          style={{ color: "var(--text-muted)" }}
        >
          <X size={20} />
        </button>

        <div className="relative z-10 flex flex-col items-center text-center mt-2">
          {/* Top Badge */}
          <div 
            className="flex items-center justify-center w-20 h-20 rounded-3xl mb-4 rotate-3 shadow-lg"
            style={{ 
              background: "linear-gradient(135deg, var(--accent), #c084fc)",
              color: "white"
            }}
          >
            <Star size={40} className="fill-current" />
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight mb-1" style={{ color: "var(--text-primary)" }}>
            Level {currentLevel}
          </h2>
          <p className="font-semibold mb-8 uppercase tracking-widest text-xs" style={{ color: "var(--text-muted)" }}>
            Current Rank
          </p>

          {/* XP Progress Section */}
          <div className="w-full bg-[var(--bg-surface)] rounded-2xl p-5 border border-[var(--border-light)] mb-6 shadow-inner">
            <div className="flex justify-between items-end mb-3">
              <div className="flex flex-col items-start gap-1">
                <span className="text-sm font-bold flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
                  <Zap size={16} style={{ color: "#f59e0b" }} className="fill-current" />
                  XP Progress
                </span>
                <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                  {fallbackXP} Total XP
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold flex items-center gap-1" style={{ color: "var(--accent)" }}>
                  {currentProgressXP} <span className="text-xs font-medium text-[var(--text-muted)]">/ {totalXPNeeded} to Level {currentLevel + 1}</span>
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-4 w-full bg-[var(--bg-card)] rounded-full overflow-hidden border border-[var(--border-light)] relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className="h-full rounded-full relative"
                style={{ background: "linear-gradient(90deg, var(--accent), #c084fc)" }}
              >
                {/* Shine effect */}
                <div className="absolute top-0 bottom-0 left-0 right-0 opacity-30" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)" }} />
              </motion.div>
            </div>
            <p className="text-xs font-medium mt-3 text-left" style={{ color: "var(--text-muted)" }}>
              Earn {totalXPNeeded - currentProgressXP} more XP to reach Level {currentLevel + 1}!
            </p>
          </div>

          {/* Next Milestone Preview */}
          <div className="w-full flex items-center justify-between p-4 rounded-xl border border-dashed border-[var(--accent)] bg-[var(--accent-light)]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--bg-card)] text-[var(--accent)] shadow-sm">
                <Trophy size={18} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Next Milestone</p>
                <p className="text-xs font-semibold" style={{ color: "var(--accent)" }}>Level {currentLevel + 1}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm">
              {nextLvlXP} Total XP <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

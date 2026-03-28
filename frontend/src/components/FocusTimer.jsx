import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Play, Pause, Square, Plus, Minus } from "lucide-react";

export default function FocusTimer() {
  const [sessionTime, setSessionTime] = useState(25); // Current set time in minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Here we could trigger a browser notification
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(sessionTime * 60);
  };

  const adjustTime = (amount) => {
    if (isActive) return; // Prevent adjusting while timer is running
    const newTime = Math.max(1, Math.min(120, sessionTime + amount)); // Between 1 and 120 minutes
    setSessionTime(newTime);
    setTimeLeft(newTime * 60);
  };

  const setPreset = (mins) => {
    if (isActive) return;
    setSessionTime(mins);
    setTimeLeft(mins * 60);
  };

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="p-2 flex items-center gap-1.5 rounded-full"
        style={{
          color: isActive ? 'var(--accent)' : 'var(--text-muted)',
          background: isActive ? 'var(--accent-light)' : 'transparent',
          transition: 'color 0.2s ease, background 0.2s ease',
        }}
        title="Focus Timer"
      >
        <Clock size={20} />
        {isActive && <span className="text-xs font-bold w-10 text-center hidden sm:inline-block tabular-nums">{minutes}:{seconds}</span>}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute top-full right-0 mt-3 p-4 rounded-xl shadow-2xl z-50 w-72"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            <div className="text-center mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Pomodoro</h4>
              </div>
              
              <div className="flex items-center justify-center gap-4 py-2">
                 <button 
                  onClick={() => adjustTime(-5)} 
                  disabled={isActive}
                  className="p-1.5 rounded-full transition-colors disabled:opacity-30"
                  style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}
                >
                  <Minus size={16} />
                </button>
                <div className="text-5xl font-black tabular-nums tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {minutes}:{seconds}
                </div>
                <button 
                  onClick={() => adjustTime(5)} 
                  disabled={isActive}
                  className="p-1.5 rounded-full transition-colors disabled:opacity-30"
                  style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Presets */}
              {!isActive && (
                <div className="flex items-center justify-center gap-2 mt-3 mb-1">
                  {[15, 25, 50].map(mins => (
                     <button
                       key={mins}
                       onClick={() => setPreset(mins)}
                       className="text-xs font-semibold px-2.5 py-1 rounded-md transition-colors"
                       style={{ 
                         background: sessionTime === mins ? 'var(--accent-light)' : 'var(--bg-input)',
                         color: sessionTime === mins ? 'var(--accent)' : 'var(--text-muted)',
                         border: sessionTime === mins ? '1px solid var(--accent)' : '1px solid transparent'
                       }}
                     >
                       {mins}m
                     </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className={`flex items-center gap-2 justify-center ${!isActive ? 'mt-4' : 'mt-0'}`}>
              <button 
                onClick={toggleTimer}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-white transition-transform active:scale-95"
                style={{ background: isActive ? '#ef4444' : 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                {isActive ? <Pause size={18} /> : <Play size={18} />}
                {isActive ? 'Pause' : 'Start Focus'}
              </button>
              
              <button 
                onClick={resetTimer}
                title="Reset Timer"
                className="p-3 rounded-lg transition-colors active:scale-95"
                style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}
              >
                <Square size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

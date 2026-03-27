import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Clock,
  FileText,
  ChevronRight,
  Loader2,
  Calendar,
  Wand2,
  BookOpen,
} from "lucide-react";
import {
  generateSummary,
  getSummaryHistory,
} from "../../services/summary.api";
import { useNavigate } from "react-router-dom";
import SpotlightCard from "../reactbits/SpotlightCard";

export default function SummaryTab({ pdfId }) {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadSummaries = async () => {
    try {
      const res = await getSummaryHistory(pdfId);
      setHistory(res.data.history || []);
    } catch (error) {
      console.error("Failed to load history", error);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await generateSummary(pdfId);
      await loadSummaries();
    } catch (error) {
      alert("Failed to generate summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummaries();
  }, [pdfId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full pb-20"
    >
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Summary History
          </h2>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
            Track your generated study notes
          </p>
        </div>

        <motion.button
          onClick={handleGenerate}
          disabled={loading}
          whileHover={{ scale: 1.04, y: -2, boxShadow: '0 12px 28px var(--accent-shadow)' }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2.5 text-white px-6 py-3 rounded-2xl font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden group"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradient-shift 3s ease-in-out infinite',
            boxShadow: '0 6px 20px var(--accent-shadow)',
          }}
        >
          {/* Shimmer effect on hover */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Wand2 size={18} />
          )}
          <span className="relative z-10">{loading ? "Generating..." : "✨ New Summary"}</span>
        </motion.button>
      </div>

      {/* Timeline List */}
      <AnimatePresence mode="wait">
        {history.length === 0 ? (
          /* Premium Empty State */
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <SpotlightCard
              className="relative overflow-hidden"
              spotlightColor="rgba(99, 102, 241, 0.15)"
            >
              <div className="flex flex-col items-center justify-center py-20 text-center relative z-10 p-8">
                {/* Animated floating icon */}
                <motion.div
                  animate={{
                    y: [0, -12, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative mb-8"
                >
                  {/* Glow ring behind icon */}
                  <div
                    className="absolute inset-0 rounded-full blur-xl opacity-40 animate-pulse"
                    style={{ background: 'var(--accent)', transform: 'scale(1.5)' }}
                  />
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center relative shadow-xl"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
                    }}
                  >
                    <BookOpen size={36} className="text-white" />
                  </div>
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-bold mb-3"
                  style={{ color: 'var(--text-primary)' }}
                >
                  No summaries yet
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="max-w-sm leading-relaxed mb-8"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Let AI analyze your document and create a comprehensive study summary instantly.
                </motion.p>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3.5 text-white rounded-2xl font-semibold disabled:opacity-70"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4)',
                  }}
                >
                  <Sparkles size={18} />
                  Generate First Summary
                </motion.button>

                {/* Decorative elements */}
                <div className="absolute top-6 right-8 opacity-[0.03]">
                  <FileText size={180} />
                </div>
              </div>
            </SpotlightCard>
          </motion.div>
        ) : (
          /* History List */
          <div
            key="list"
            className="space-y-4"
          >
            {history.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => {
                  navigate(`/document/${pdfId}/summary/${item._id}`, { state: { summary: item.output } });
                }}
                whileHover={{ x: 4 }}
                className="group relative rounded-2xl p-5 cursor-pointer flex items-center justify-between"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.boxShadow = '0 4px 20px var(--accent-shadow)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Timeline connector */}
                {index !== history.length - 1 && (
                  <div
                    className="absolute left-[29px] top-16 bottom-[-24px] w-px hidden sm:block"
                    style={{ background: 'var(--border-light)' }}
                  />
                )}

                <div className="flex items-start gap-5">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="p-3 rounded-xl z-10 shadow-sm"
                    style={{
                      background: 'var(--accent-light)',
                      color: 'var(--accent)',
                      border: '3px solid var(--bg-card)',
                    }}
                  >
                    <FileText size={24} />
                  </motion.div>

                  <div className="flex-1">
                    <h4
                      className="font-bold text-lg"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Summary Version {history.length - index}
                    </h4>
                    <div className="flex items-center gap-4 mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <motion.div
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                  style={{ color: 'var(--text-muted)' }}
                >
                  <ChevronRight size={24} />
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

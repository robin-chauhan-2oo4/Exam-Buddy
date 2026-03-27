import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  BookOpen,
  BrainCircuit,
  HelpCircle,
  Clock,
  Activity,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { getDashboardStats } from "../services/dashboard.api.js";
import Layout from "../components/Layout.jsx";
import CountUp from "../components/reactbits/CountUp";
import SpotlightCard from "../components/reactbits/SpotlightCard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const activityItemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getDashboardStats();
        if (data) {
          setStats(data.stats || {});
          setActivity(data.recentActivity || []);
        }
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleActivityClick = (item) => {
    const pdfId = item.pdf?._id || item.pdf;
    if (!pdfId) return;

    let targetTab = "summary";
    const type = item.type?.toLowerCase() || "";
    if (type.includes("quiz")) targetTab = "quiz";
    else if (type.includes("flashcard")) targetTab = "flashcards";
    else if (type.includes("chat")) targetTab = "chat";

    navigate(`/document/${pdfId}`, { state: { activeTab: targetTab } });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 border-4 rounded-full animate-spin"
                style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full animate-pulse" style={{ background: 'var(--accent-light)' }} />
              </div>
            </div>
            <p className="font-medium animate-pulse" style={{ color: 'var(--text-muted)' }}>
              Loading your progress...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6 sm:space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6"
          style={{ borderBottom: '1px solid var(--border-color)' }}
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Dashboard
            </h1>
            <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
              Track your learning progress and recent activity.
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.03, y: -1 }}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg"
            style={{
              color: 'var(--text-muted)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              transition: 'box-shadow 0.3s ease',
            }}
          >
            <Clock size={16} />
            <span className="hidden sm:inline">Last updated: {new Date().toLocaleTimeString()}</span>
            <span className="sm:hidden">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Documents"
            value={stats?.totalDocuments || 0}
            icon={<FileText size={24} />}
            color="#6366f1"
            delay={0}
          />
          <StatCard
            title="Summaries Generated"
            value={stats?.totalSummaries || 0}
            icon={<BookOpen size={24} />}
            color="#8b5cf6"
            delay={0.08}
          />
          <StatCard
            title="Flashcards Created"
            value={stats?.totalFlashcards || 0}
            icon={<BrainCircuit size={24} />}
            color="#f59e0b"
            delay={0.16}
          />
          <StatCard
            title="Quizzes Taken"
            value={stats?.totalQuizzes || 0}
            icon={<HelpCircle size={24} />}
            color="#10b981"
            delay={0.24}
          />
        </motion.div>

        {/* Activity Section */}
        <motion.div variants={itemVariants}
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="px-6 py-5 flex items-center gap-3"
            style={{ borderBottom: '1px solid var(--border-light)' }}
          >
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="p-2 rounded-lg"
              style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
            >
              <Activity size={20} />
            </motion.div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Recent Activity
            </h2>
          </div>

          <div>
            {activity.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-12 text-center"
                style={{ color: 'var(--text-muted)' }}
              >
                <p>No recent activity found. Start by uploading a document!</p>
              </motion.div>
            ) : (
              activity.map((item, index) => (
                <motion.div
                  key={item._id}
                  custom={index}
                  variants={activityItemVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ x: 4 }}
                  onClick={() => handleActivityClick(item)}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 cursor-pointer relative overflow-hidden gap-3 sm:gap-4"
                  style={{
                    borderBottom: '1px solid var(--border-light)',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--bg-card-hover)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {/* Hover accent line */}
                  <span
                    className="absolute left-0 top-0 bottom-0 w-0.5 opacity-0 group-hover:opacity-100"
                    style={{
                      background: getTypeColorText(item.type),
                      transition: 'opacity 0.2s ease',
                    }}
                  />

                  <div className="flex items-start gap-4">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="mt-1 p-2 rounded-lg shrink-0"
                      style={{
                        background: getTypeColorBg(item.type),
                        color: getTypeColorText(item.type),
                      }}
                    >
                      {getTypeIcon(item.type)}
                    </motion.div>
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {formatType(item.type)}
                      </p>
                      <p className="text-sm mt-0.5 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                        <FileText size={12} />
                        {item.pdf?.filename || "Unknown Document"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:text-right">
                    <div className="hidden sm:block">
                      <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, x: -4 }}
                      whileHover={{ opacity: 1, x: 0 }}
                      className="opacity-0 group-hover:opacity-100"
                      style={{
                        color: 'var(--accent)',
                        transition: 'opacity 0.2s ease',
                      }}
                    >
                      <ArrowUpRight size={16} />
                    </motion.div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {activity.length > 0 && (
            <div className="px-6 py-4 text-center"
              style={{ borderTop: '1px solid var(--border-light)', background: 'var(--bg-surface)' }}
            >
              <motion.button
                whileHover={{ scale: 1.03, gap: '8px' }}
                whileTap={{ scale: 0.97 }}
                className="text-sm font-semibold flex items-center justify-center gap-1 mx-auto"
                style={{
                  color: 'var(--accent)',
                  transition: 'gap 0.3s ease',
                }}
              >
                View Full History <ArrowUpRight size={16} />
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </Layout>
  );
}

// --- Sub-components & Helpers ---

function StatCard({ title, value, icon, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.2 + delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <SpotlightCard
        className="relative overflow-hidden group"
        spotlightColor={`${color}25`}
      >
        {/* Gradient accent bar at top */}
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}88, transparent)` }}
        />

        <div className="p-4 sm:p-6">
          {/* Decorative gradient circle in corner */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.07, 0.12, 0.07] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-8 -right-8 w-28 h-28 rounded-full"
            style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }}
          />

          {/* Icon with glowing background */}
          <div className="flex items-start justify-between mb-5">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-3 rounded-2xl shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${color}20, ${color}10)`,
                color,
                boxShadow: `0 4px 14px ${color}20`,
                border: `1px solid ${color}15`,
              }}
            >
              {icon}
            </motion.div>
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{
                color: 'var(--text-muted)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
              }}
            >
              All Time
            </span>
          </div>

          {/* Large number + label */}
          <div>
            <h3
              className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-none"
              style={{ color: 'var(--text-primary)' }}
            >
              <CountUp to={value} from={0} duration={2} delay={0.5 + delay} />
            </h3>
            <p
              className="text-sm font-semibold mt-2 flex items-center gap-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="w-2 h-2 rounded-full inline-block"
                style={{ background: color }}
              />
              {title}
            </p>
          </div>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}

function getTypeColorBg(type) {
  const t = type?.toLowerCase() || "";
  if (t.includes("summary")) return "rgba(139, 92, 246, 0.15)";
  if (t.includes("flashcard")) return "rgba(245, 158, 11, 0.15)";
  if (t.includes("quiz")) return "rgba(16, 185, 129, 0.15)";
  return "var(--accent-light)";
}

function getTypeColorText(type) {
  const t = type?.toLowerCase() || "";
  if (t.includes("summary")) return "#a78bfa";
  if (t.includes("flashcard")) return "#fbbf24";
  if (t.includes("quiz")) return "#34d399";
  return "var(--accent)";
}

function getTypeIcon(type) {
  const t = type?.toLowerCase() || "";
  if (t.includes("summary")) return <BookOpen size={18} />;
  if (t.includes("flashcard")) return <BrainCircuit size={18} />;
  if (t.includes("quiz")) return <HelpCircle size={18} />;
  return <Activity size={18} />;
}

function formatType(type) {
  if (!type) return "Activity";
  return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " ");
}

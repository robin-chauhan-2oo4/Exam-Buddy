import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  BookOpen,
  BrainCircuit,
  HelpCircle,
  Activity,
  ArrowUpRight,
  Flame,
  Star,
  Zap,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { getDashboardStats } from "../services/dashboard.api.js";
import API from "../services/apiClient.js";
import Layout from "../components/Layout.jsx";
import CountUp from "../components/reactbits/CountUp";
import SpotlightCard from "../components/reactbits/SpotlightCard";
import TasksWidget from "../components/TasksWidget";

const DAILY_GOAL_XP = 200;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const activityItemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [gamification, setGamification] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [data, gamificationData] = await Promise.all([
          getDashboardStats(),
          API.get("/progress/stats").then(res => res.data).catch(() => null)
        ]);

        if (data) {
          setStats(data.stats || {});
          setActivity(data.recentActivity || []);
        }

        if (gamificationData) {
          setGamification(gamificationData);
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
    else if (type.includes("probable")) targetTab = "probable";

    navigate(`/document/${pdfId}`, { state: { activeTab: targetTab } });
  };

  // Derive gamification values
  const todayXP = gamification?.activity?.find(a => a.date === new Date().toISOString().substring(0, 10))?.xpGained || 0;
  const dailyGoalPct = Math.min((todayXP / DAILY_GOAL_XP) * 100, 100);
  const userLevel = gamification?.stats?.level || 1;
  const userXP = gamification?.stats?.xp || 0;
  const streak = gamification?.stats?.currentStreak || 0;

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
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* ── Hero Banner ── */}
        <motion.div
          variants={itemVariants}
          className="relative rounded-2xl overflow-hidden p-6 sm:p-8"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
          }}
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ background: '#fbbf24' }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 blur-3xl" style={{ background: '#60a5fa' }} />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back! 👋
              </h1>
              <p className="text-white/70 mt-1 text-sm sm:text-base">
                Keep up the momentum — your learning streak is going strong.
              </p>
            </div>

            {/* Mini stat pills */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
                <Star size={16} className="text-yellow-300 fill-yellow-300" />
                <span className="text-sm font-bold text-white">Level {userLevel}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
                <Zap size={16} className="text-yellow-300 fill-yellow-300" />
                <span className="text-sm font-bold text-white">{userXP} XP</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
                <Flame size={16} className={`${streak > 0 ? 'text-orange-400 fill-orange-400' : 'text-white/50'}`} />
                <span className="text-sm font-bold text-white">{streak} Day{streak !== 1 && 's'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Stats Grid ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Documents"
            value={stats?.totalDocuments || 0}
            icon={<FileText size={22} />}
            color="#6366f1"
          />
          <StatCard
            title="Summaries"
            value={stats?.totalSummaries || 0}
            icon={<BookOpen size={22} />}
            color="#8b5cf6"
          />
          <StatCard
            title="Flashcards"
            value={stats?.totalFlashcards || 0}
            icon={<BrainCircuit size={22} />}
            color="#f59e0b"
          />
          <StatCard
            title="Quizzes"
            value={stats?.totalQuizzes || 0}
            icon={<HelpCircle size={22} />}
            color="#10b981"
          />
        </motion.div>

        {/* ── Daily Goal (Full Width) ── */}
        {gamification && (
          <motion.div
            variants={itemVariants}
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            {/* Subtle glow */}
            <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-10 blur-3xl" style={{ background: 'var(--accent)' }} />

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(249, 115, 22, 0.1))', color: '#f59e0b' }}>
                  <Zap size={18} className="fill-current" />
                </div>
                <div>
                  <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Daily Goal</h2>
                  <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                    {todayXP >= DAILY_GOAL_XP ? 'Goal reached! 🔥' : `${DAILY_GOAL_XP - todayXP} XP to go`}
                  </p>
                </div>
              </div>
              <span className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                <CountUp to={todayXP} from={0} duration={1.2} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}> / {DAILY_GOAL_XP}</span>
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-3 w-full rounded-full overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${dailyGoalPct}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                className="h-full rounded-full relative"
                style={{
                  background: dailyGoalPct >= 100
                    ? 'linear-gradient(90deg, #f59e0b, #f97316, #ef4444)'
                    : 'linear-gradient(90deg, var(--accent), #c084fc)',
                }}
              >
                <div className="absolute inset-0 opacity-40" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.4), transparent)' }} />
              </motion.div>
            </div>

            {dailyGoalPct >= 100 && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-semibold mt-3 text-center"
                style={{ color: '#f59e0b' }}
              >
                🎉 Amazing work! You've crushed today's goal!
              </motion.p>
            )}
          </motion.div>
        )}

        {/* ── Tasks + Recent Activity: side by side ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column - Tasks */}
          <div className="lg:col-span-5">
            <motion.div
              variants={itemVariants}
              className="rounded-2xl p-5 h-full"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <TasksWidget />
            </motion.div>
          </div>

          {/* Right Column - Recent Activity */}
          <div className="lg:col-span-7">
            <motion.div
              variants={itemVariants}
              className="rounded-2xl overflow-hidden flex flex-col h-full"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div className="px-6 py-5 flex items-center justify-between shrink-0"
                style={{ borderBottom: '1px solid var(--border-light)' }}
              >
                <div className="flex items-center gap-3">
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
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                  style={{
                    color: 'var(--text-muted)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  Last 5
                </span>
              </div>

              <div className="overflow-y-auto custom-scrollbar">
                {activity.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-12 text-center flex flex-col items-center gap-3"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-surface)' }}>
                      <FileText size={32} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <p className="font-medium">No recent activity yet.</p>
                    <p className="text-sm">Upload a document and start studying to see your progress here!</p>
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
                      className="group flex items-center justify-between p-4 sm:px-6 sm:py-5 cursor-pointer relative overflow-hidden"
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

                      <div className="flex items-center gap-4 min-w-0">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="p-2.5 rounded-xl shrink-0"
                          style={{
                            background: getTypeColorBg(item.type),
                            color: getTypeColorText(item.type),
                          }}
                        >
                          {getTypeIcon(item.type)}
                        </motion.div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                            {formatType(item.type)}
                          </p>
                          <p className="text-xs mt-0.5 flex items-center gap-1.5 truncate" style={{ color: 'var(--text-muted)' }}>
                            <FileText size={11} />
                            {item.pdf?.filename || "Unknown Document"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <motion.div
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


            </motion.div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}

// --- Sub-components & Helpers ---

function StatCard({ title, value, icon, color }) {
  return (
    <SpotlightCard
      className="relative overflow-hidden group"
      spotlightColor={`${color}20`}
    >
      <div className="p-4 sm:p-5 flex items-center gap-4">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="p-2.5 rounded-xl shrink-0"
          style={{
            background: `${color}15`,
            color,
            border: `1px solid ${color}20`,
          }}
        >
          {icon}
        </motion.div>

        <div className="min-w-0">
          <h3
            className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-none"
            style={{ color: 'var(--text-primary)' }}
          >
            <CountUp to={value} from={0} duration={1.8} />
          </h3>
          <p
            className="text-xs font-semibold mt-0.5 truncate"
            style={{ color: 'var(--text-muted)' }}
          >
            {title}
          </p>
        </div>
      </div>
    </SpotlightCard>
  );
}

function getTypeColorBg(type) {
  const t = type?.toLowerCase() || "";
  if (t.includes("summary")) return "rgba(139, 92, 246, 0.12)";
  if (t.includes("flashcard")) return "rgba(245, 158, 11, 0.12)";
  if (t.includes("quiz")) return "rgba(16, 185, 129, 0.12)";
  if (t.includes("probable")) return "rgba(236, 72, 153, 0.12)";
  return "var(--accent-light)";
}

function getTypeColorText(type) {
  const t = type?.toLowerCase() || "";
  if (t.includes("summary")) return "#a78bfa";
  if (t.includes("flashcard")) return "#fbbf24";
  if (t.includes("quiz")) return "#34d399";
  if (t.includes("probable")) return "#f472b6";
  return "var(--accent)";
}

function getTypeIcon(type) {
  const t = type?.toLowerCase() || "";
  if (t.includes("summary")) return <BookOpen size={18} />;
  if (t.includes("flashcard")) return <BrainCircuit size={18} />;
  if (t.includes("quiz")) return <HelpCircle size={18} />;
  if (t.includes("probable")) return <TrendingUp size={18} />;
  return <Activity size={18} />;
}

function formatType(type) {
  if (!type) return "Activity";
  return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " ");
}

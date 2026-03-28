import { motion } from "framer-motion";
import { Zap, BookOpen, BrainCircuit, HelpCircle, MessageSquare, Play, FileQuestion } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AVAILABLE_TASKS = [
  {
    id: "summary",
    title: "Generate a Document Summary",
    xp: 20,
    icon: BookOpen,
    color: "#8b5cf6",
    bg: "rgba(139, 92, 246, 0.1)",
    route: "/documents",
  },
  {
    id: "flashcards",
    title: "Review Due Flashcards",
    xp: 5,
    icon: BrainCircuit,
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.1)",
    route: "/documents",
  },
  {
    id: "quiz",
    title: "Complete a Quiz",
    xp: 50,
    icon: HelpCircle,
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.1)",
    route: "/documents",
  },
  {
    id: "probable",
    title: "Generate Probable Questions",
    xp: 15,
    icon: FileQuestion,
    color: "#ec4899",
    bg: "rgba(236, 72, 153, 0.1)",
    route: "/documents",
  },
  {
    id: "chat",
    title: "Ask AI a Question (AMA)",
    xp: 10,
    icon: MessageSquare,
    color: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.1)",
    route: "/ama",
  },
];

export default function TasksWidget() {
  const navigate = useNavigate();

  const handlePerformTask = (task) => {
    navigate(task.route);
  };

  return (
    <div className="flex flex-col gap-3 h-full w-full">
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 rounded-lg" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
          <Zap size={16} />
        </div>
        <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
          Ways to Earn XP
        </h2>
      </div>

      <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {AVAILABLE_TASKS.map((task, idx) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07 }}
            className="group flex items-center justify-between p-3 rounded-xl transition-all"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = task.color;
              e.currentTarget.style.boxShadow = `0 0 12px ${task.color}15`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-light)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="p-2 rounded-lg shrink-0 transition-transform group-hover:scale-110"
                style={{ background: task.bg, color: task.color }}
              >
                <task.icon size={16} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {task.title}
                </span>
                <span
                  className="text-[11px] font-bold"
                  style={{ color: task.color }}
                >
                  +{task.xp} XP
                </span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePerformTask(task)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 text-white"
              style={{ background: task.color }}
            >
              <Play size={10} className="fill-current" /> Go
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

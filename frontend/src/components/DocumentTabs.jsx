import { motion } from "framer-motion";
import {
  MessageSquare,
  CheckCircle2,
  Layers,
  FileText,
} from "lucide-react";

export default function DocumentTabs({ active, onChange }) {
  const tabs = [
    { id: "summary", label: "Summary", icon: FileText },
    { id: "flashcards", label: "Flashcards", icon: Layers },
    { id: "quiz", label: "Practice Quiz", icon: CheckCircle2 },
    { id: "chat", label: "AI Chat", icon: MessageSquare },
  ];

  return (
    <div className="flex items-center gap-0 sm:gap-1 mb-4 sm:mb-6 px-1 sm:px-2 rounded-t-xl overflow-x-auto no-scrollbar relative z-10"
      style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;

        return (
          <motion.button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="relative flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium outline-none whitespace-nowrap group flex-1 sm:flex-initial"
            style={{
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              transition: 'color 0.25s ease',
            }}
          >
            {/* Hover background */}
            <span
              className="absolute inset-x-1 inset-y-1 rounded-lg opacity-0 group-hover:opacity-100"
              style={{
                background: 'var(--accent-light)',
                transition: 'opacity 0.25s ease',
              }}
            />

            <motion.div
              animate={{
                scale: isActive ? 1.1 : 1,
                rotate: isActive ? 5 : 0,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="relative z-10"
            >
              <Icon size={18} className={isActive ? "stroke-[2.5px]" : "stroke-2"} />
            </motion.div>
            <span className="relative z-10 hidden sm:inline">{tab.label}</span>

            {isActive && (
              <motion.span
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 w-full h-[3px] rounded-t-full"
                style={{
                  background: 'linear-gradient(90deg, var(--accent), #8b5cf6)',
                  boxShadow: '0 -2px 8px var(--accent-shadow)',
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

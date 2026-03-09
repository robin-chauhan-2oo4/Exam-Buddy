import {
  BrainCircuit,
  MessageSquare,
  CheckCircle2,
  Layers,
  FileText,
} from "lucide-react";

export default function DocumentTabs({ active, onChange }) {
  // Configuration for tabs with icons and proper labels
  const tabs = [
    // ✅ ADDED: Summary Tab (First item)
    { id: "summary", label: "Summary", icon: FileText },
    { id: "flashcards", label: "Flashcards", icon: Layers },
    { id: "quiz", label: "Practice Quiz", icon: CheckCircle2 },
    { id: "chat", label: "AI Chat", icon: MessageSquare },
  ];

  return (
    <div className="flex items-center gap-1 border-b border-slate-200 mb-6 bg-white px-2 rounded-t-xl sticky top-0 z-10 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              relative flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 outline-none whitespace-nowrap
              ${
                isActive ? "text-blue-600" : (
                  "text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-lg"
                )
              }
            `}>
            <Icon
              size={18}
              className={isActive ? "stroke-[2.5px]" : "stroke-2"}
            />
            <span>{tab.label}</span>

            {/* Active Indicator Line (Animated) */}
            {isActive && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full animate-in fade-in zoom-in-x duration-300" />
            )}
          </button>
        );
      })}
    </div>
  );
}


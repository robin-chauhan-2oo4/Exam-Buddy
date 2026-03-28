import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, FileText, Bot, Zap, Plus, ChevronRight, X, Sparkles, CheckCircle2, Circle } from "lucide-react";
import Layout from "../components/Layout";
import GradientText from "../components/reactbits/GradientText";
import API from "../services/apiClient";
import { toast } from "react-toastify";
import BlurText from "../components/reactbits/BlurText";

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

export default function StudyPlannerPage() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [activePlanIdx, setActivePlanIdx] = useState(0);
  
  // Creation Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [availableDocs, setAvailableDocs] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [planTitle, setPlanTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchPlans();
    fetchDocs();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await API.get("/study-plan");
      setPlans(res.data.plans || []);
    } catch (err) {
      console.error("Failed to fetch plans", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocs = async () => {
    try {
      const res = await API.get("/pdf");
      setAvailableDocs(res.data.pdfs || []);
    } catch (error) {
      console.error("Failed to load generic documents");
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!planTitle.trim() || !examDate || selectedDocs.length === 0) {
      toast.error("Please fill in all fields and select at least one document.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await API.post("/study-plan/generate", {
        title: planTitle,
        examDate,
        pdfIds: selectedDocs,
      });
      setPlans([res.data.plan, ...plans]);
      setActivePlanIdx(0);
      setShowCreateModal(false);
      
      // Reset form
      setPlanTitle("");
      setExamDate("");
      setSelectedDocs([]);
      toast.success("AI strictly scheduled your study plan!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to generate plan");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleTask = async (planId, taskId) => {
    try {
      const res = await API.put(`/study-plan/${planId}/tasks/${taskId}/complete`);
      // Update local state instantly to reflect completion
      setPlans(prevPlans => prevPlans.map(p => {
        if (p._id !== planId) return p;
        return {
          ...p,
          schedule: p.schedule.map(d => ({
            ...d,
            tasks: d.tasks.map(t => t._id === taskId ? { ...t, isCompleted: true } : t)
          }))
        };
      }));

      // Trigger gamification event dispatch
      if (res.data.gamification) {
        toast.success("Task completed! +15 XP");
        // We could bubble this up to Topbar via Context, but for now the user will see it on refresh or Dashboard.
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark task");
    }
  };

  return (
    <>
    <Layout>
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                <CalendarDays size={24} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                AI Study Planner
              </h1>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Let AI dynamically schedule your study sessions leading up to zero-hour.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg text-white"
            style={{
              background: 'linear-gradient(135deg, var(--accent), #c084fc)',
            }}
          >
            <Sparkles size={18} className="animate-pulse" /> Create New Plan
          </motion.button>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)' }} />
          </div>
        ) : plans.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="py-20 text-center">
            <Bot size={64} className="mx-auto mb-6 opacity-20" style={{ color: 'var(--text-primary)' }} />
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No Plans Yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Click Create New Plan to automatically generate a schedule from your documents.
            </p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4 w-full">
            <h3 className="text-xs font-bold uppercase tracking-wider pl-1" style={{ color: 'var(--text-muted)' }}>Your Roadmaps</h3>
            
            {plans.map((p, idx) => (
              <div key={p._id} className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm transition-all focus-within:ring-2 focus-within:ring-[var(--accent)]">
                <button
                  onClick={() => setActivePlanIdx(activePlanIdx === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between transition-colors hover:bg-[var(--bg-surface)]"
                  style={{ background: activePlanIdx === idx ? 'var(--bg-surface)' : 'transparent' }}
                >
                  <div>
                    <h4 className="font-bold text-lg mb-1" style={{ color: activePlanIdx === idx ? 'var(--accent)' : 'var(--text-primary)' }}>
                      {p.title}
                    </h4>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                      Exam: {new Date(p.examDate).toLocaleDateString()}
                    </p>
                  </div>
                  <motion.div
                    animate={{ rotate: activePlanIdx === idx ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-[var(--text-muted)]"
                  >
                    <ChevronRight size={24} />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {activePlanIdx === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-[var(--border-light)] overflow-hidden"
                    >
                      <PlanDetailView plan={p} onToggleTask={handleToggleTask} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </motion.div>

    </Layout>

      {/* Creation Modal - rendered via Portal outside Layout to sit above sidebar/topbar */}
      {createPortal(
        <AnimatePresence>
          {showCreateModal && (
            <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 99999, isolation: "isolate" }}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
                style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
                onClick={() => !isGenerating && setShowCreateModal(false)}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl shadow-2xl"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                  zIndex: 10,
                }}
              >
                <div className="flex justify-between items-center mb-6">
                  <GradientText colors={["#8b5cf6", "#3b82f6"]} className="text-2xl font-bold">
                    Configure Study Plan
                  </GradientText>
                  <button
                    onClick={() => !isGenerating && setShowCreateModal(false)}
                    className="p-2 rounded-full transition-colors"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleGenerate} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Plan Title</label>
                    <input
                      required
                      disabled={isGenerating}
                      type="text"
                      value={planTitle}
                      onChange={(e) => setPlanTitle(e.target.value)}
                      placeholder="e.g., Biology Final Prep"
                      className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
                      style={{
                        background: "var(--bg-input)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border-color)",
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Target Exam Date</label>
                    <input
                      required
                      disabled={isGenerating}
                      type="date"
                      min={new Date().toISOString().substring(0, 10)}
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
                      style={{
                        background: "var(--bg-input)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border-color)",
                        colorScheme: "dark",
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>Source Material (Documents)</label>
                    <div className="max-h-48 overflow-y-auto rounded-xl p-2 flex flex-col gap-1 custom-scrollbar" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)" }}>
                      {availableDocs.map((doc) => {
                        const isSelected = selectedDocs.includes(doc._id);
                        return (
                          <label
                            key={doc._id}
                            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                            style={{ background: isSelected ? "var(--accent-light)" : "transparent" }}
                          >
                            <input
                              type="checkbox"
                              disabled={isGenerating}
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedDocs([...selectedDocs, doc._id]);
                                else setSelectedDocs(selectedDocs.filter((id) => id !== doc._id));
                              }}
                              className="w-4 h-4 rounded"
                              style={{ accentColor: "var(--accent)" }}
                            />
                            <FileText size={16} style={{ color: isSelected ? "var(--accent)" : "var(--text-muted)" }} />
                            <span className="text-sm font-medium truncate flex-1" style={{ color: "var(--text-primary)" }}>
                              {doc.originalName || doc.filename}
                            </span>
                          </label>
                        );
                      })}
                      {availableDocs.length === 0 && (
                        <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>No documents uploaded yet.</p>
                      )}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isGenerating || availableDocs.length === 0}
                    type="submit"
                    className="w-full py-3.5 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 overflow-hidden relative"
                    style={{
                      background: isGenerating ? "var(--bg-surface)" : "linear-gradient(90deg, #8b5cf6, #3b82f6)",
                      color: isGenerating ? "var(--text-muted)" : "white",
                    }}
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--text-muted)" }} />
                        <BlurText text="Generating Optimal Plan..." className="text-sm tracking-wide" />
                      </>
                    ) : (
                      <>
                        <Zap size={18} className="fill-current" /> Build Study Plan
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

// Sub-component for the Hybrid View
function PlanDetailView({ plan, onToggleTask }) {
  // We extract the schedule and set an active day via a horizontal calendar strip
  const schedule = plan.schedule || [];
  const [activeDayIdx, setActiveDayIdx] = useState(0);

  // If the plan has no valid days
  if (schedule.length === 0) {
    return <div className="p-8 text-center text-[var(--text-muted)]">Empty unreadable plan. Please delete and regenerate.</div>;
  }

  // Ensure active day is within bounds
  const currentDay = schedule[activeDayIdx] || schedule[0];

  const calculateProgress = () => {
    let total = 0;
    let completed = 0;
    schedule.forEach(d => {
      d.tasks.forEach(t => {
        total++;
        if (t.isCompleted) completed++;
      });
    });
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  const progress = calculateProgress();

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)]">
      {/* Detail Header */}
      <div className="p-6 border-b border-[var(--border-light)] bg-gradient-to-r from-[var(--bg-card)] to-[var(--bg-surface)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">Progress Overview</h2>
          <span className="text-xs font-black uppercase tracking-widest px-3 py-1 bg-[var(--accent-light)] text-[var(--accent)] rounded-full shadow-sm">
            {progress}% Complete
          </span>
        </div>
        
        {/* Full Plan Progress Bar */}
        <div className="h-2 w-full bg-[var(--border-light)] rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-[var(--accent)] rounded-full"
          />
        </div>
      </div>

      {/* Mini Google Calendar Strip */}
      <div className="w-full overflow-x-auto pb-4 pt-6 px-6 custom-scrollbar shrink-0">
        <div className="flex gap-3 min-w-max">
          {schedule.map((day, idx) => {
            const dateObj = new Date(day.date);
            const isPast = dateObj < new Date(new Date().setHours(0,0,0,0));
            const dayLabel = dateObj.toLocaleDateString("en-US", { weekday: "short" });
            const dateLabel = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            const allTasksCompleted = day.tasks.length > 0 && day.tasks.every(t => t.isCompleted);

            return (
              <button
                key={idx}
                onClick={() => setActiveDayIdx(idx)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl min-w-[72px] transition-all relative overflow-hidden"
                style={{
                  background: activeDayIdx === idx ? "var(--accent)" : "var(--bg-surface)",
                  color: activeDayIdx === idx ? "white" : "var(--text-primary)",
                  boxShadow: activeDayIdx === idx ? "0 10px 25px -5px var(--accent-shadow)" : "none",
                  border: `1px solid ${activeDayIdx === idx ? "transparent" : "var(--border-light)"}`,
                  opacity: (isPast && activeDayIdx !== idx) ? 0.6 : 1
                }}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">{dayLabel}</span>
                <span className="text-sm font-black">{dateLabel.split(" ")[1]}</span>
                {allTasksCompleted && activeDayIdx !== idx && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full text-green-500">
                    <CheckCircle2 size={10} className="fill-current" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vertical Task Checklist for Active Day */}
      <div className="flex-1 p-6 flex flex-col bg-[var(--bg-surface)] min-h-[400px]">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-6 flex items-center gap-2">
          Tasks for {new Date(currentDay.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </h3>

        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {currentDay.tasks.length === 0 && (
              <p className="text-[var(--text-muted)] text-sm italic">No tasks scheduled for this day. Rest up!</p>
            )}
            
            {currentDay.tasks.map((task, i) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${task.isCompleted ? "bg-[var(--bg-card)] border-transparent opacity-60" : "bg-[var(--bg-card)] border-[var(--border-light)] hover:border-[var(--accent)] shadow-sm"}`}
                onClick={() => !task.isCompleted && onToggleTask(plan._id, task._id)}
              >
                <div className={`mt-0.5 shrink-0 ${task.isCompleted ? "text-green-500" : "text-[var(--text-muted)]"}`}>
                  {task.isCompleted ? <CheckCircle2 size={24} className="fill-current text-[var(--bg-card)]" /> : <Circle size={24} />}
                </div>
                
                <div className="flex flex-col flex-1">
                  <h4 className={`font-bold text-base mb-1 ${task.isCompleted ? "text-[var(--text-muted)] line-through" : "text-[var(--text-primary)]"}`}>
                    {task.title}
                  </h4>
                  <p className={`text-sm ${task.isCompleted ? "text-[var(--text-muted)]" : "text-[var(--text-secondary)]"}`}>
                    {task.description}
                  </p>
                </div>

                {task.isCompleted && (
                  <div className="shrink-0 text-xs font-black uppercase text-green-500 bg-green-500/10 px-2 py-1 rounded">
                    Done
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}

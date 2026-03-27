import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Calendar, ChevronRight, FileText,
  Trash2, Loader2, Search, CheckCircle2, HelpCircle, AlertTriangle,
} from "lucide-react";
import API from "../services/apiClient";
import Layout from "../components/Layout.jsx";
import { toast } from "react-toastify";

export default function QuizHistoryPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const res = await API.get("/ai/quizzes/all");
        setQuizzes(res.data.quizzes || []);
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Failed to load quiz history.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const openDeleteModal = (e, quizId) => {
    e.stopPropagation();
    e.preventDefault();
    setItemToDelete(quizId);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsModalOpen(false);
    const statusId = toast.loading("Removing quiz record...");
    try {
      await API.delete(`/ai/history/${itemToDelete}`);
      setQuizzes((prev) => prev.filter((q) => q._id !== itemToDelete));
      toast.update(statusId, { render: "Deleted successfully", type: "success", isLoading: false, autoClose: 2000 });
    } catch (err) {
      toast.update(statusId, { render: "Failed to delete", type: "error", isLoading: false, autoClose: 2000 });
    } finally {
      setItemToDelete(null);
    }
  };

  const filteredQuizzes = quizzes.filter((q) =>
    (q.pdf?.filename || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto relative"
      >

        {/* Delete Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 backdrop-blur-sm"
                style={{ background: 'rgba(0,0,0,0.4)' }}
                onClick={() => setIsModalOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="relative rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
              >
                <div className="p-6 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4"
                    style={{ background: 'var(--danger-bg)', color: 'var(--danger-text)' }}
                  >
                    <AlertTriangle size={24} />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Delete Quiz Record?</h3>
                  <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                    This will permanently remove this quiz from your history. This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                      style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                    >
                      Cancel
                    </button>
                    <button onClick={confirmDelete}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 shadow-lg active:scale-95 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-4 rounded-2xl shadow-sm"
              style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
            >
              <GraduationCap size={32} />
            </motion.div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Quiz History</h1>
              <p className="font-medium text-sm" style={{ color: 'var(--text-muted)' }}>Review your past practice sessions.</p>
            </div>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by document..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:ring-4 transition-all shadow-sm"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                '--tw-ring-color': 'var(--accent-light)',
              }}
            />
          </div>
        </div>

        {/* Quiz List */}
        <div className="space-y-4 sm:space-y-6">
          {loading ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
              <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Loading History
              </p>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="rounded-3xl p-20 text-center"
              style={{ background: 'var(--bg-card)', border: '2px dashed var(--border-color)' }}
            >
              <HelpCircle className="mx-auto mb-4" size={48} style={{ color: 'var(--text-muted)' }} />
              <p className="font-medium" style={{ color: 'var(--text-muted)' }}>No quiz sessions found.</p>
            </div>
          ) : (
            filteredQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <QuizCard quiz={quiz} onDelete={openDeleteModal} />
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </Layout>
  );
}

function QuizCard({ quiz, onDelete }) {
  const quizData = typeof quiz.output === "string" ? JSON.parse(quiz.output) : quiz.output;

  return (
    <details className="group rounded-2xl overflow-hidden transition-all"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
    >
      <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
        <div className="flex items-center gap-5">
          <div className="p-3 rounded-xl group-hover:scale-110 transition-transform"
            style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
          >
            <FileText size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              {quiz.pdf?.filename || "Quiz Session"}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>
                <Calendar size={14} /> {new Date(quiz.createdAt).toLocaleDateString()}
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest"
                style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
              >
                {quizData.length} Questions
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={(e) => onDelete(e, quiz._id)}
            className="p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            style={{ color: 'var(--text-muted)' }}
          >
            <Trash2 size={18} />
          </button>
          <ChevronRight className="group-open:rotate-90 transition-transform" size={20} style={{ color: 'var(--text-muted)' }} />
        </div>
      </summary>

      <div className="px-8 pb-8 pt-4"
        style={{ borderTop: '1px solid var(--border-light)', background: 'var(--bg-surface)' }}
      >
        <div className="space-y-8">
          {quizData.map((q, idx) => (
            <div key={idx} className="p-6 rounded-2xl"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}
            >
              <div className="flex gap-4">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 text-white"
                  style={{ background: 'var(--accent)' }}
                >
                  {idx + 1}
                </span>
                <div className="space-y-4 flex-1">
                  <p className="font-bold leading-relaxed pt-1" style={{ color: 'var(--text-primary)' }}>
                    {q.question}
                  </p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {q.options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className="p-3 rounded-xl border text-sm font-medium flex items-center gap-3"
                        style={{
                          background: opt === q.correctAnswer ? 'var(--success-bg)' : 'var(--bg-surface)',
                          borderColor: opt === q.correctAnswer ? 'var(--success-text)' : 'var(--border-light)',
                          color: opt === q.correctAnswer ? 'var(--success-text)' : 'var(--text-muted)',
                        }}
                      >
                        <div className="w-2 h-2 rounded-full"
                          style={{ background: opt === q.correctAnswer ? 'var(--success-text)' : 'var(--text-muted)' }}
                        />
                        {opt}
                        {opt === q.correctAnswer && <CheckCircle2 size={14} className="ml-auto" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}

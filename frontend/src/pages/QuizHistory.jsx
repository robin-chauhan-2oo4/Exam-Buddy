import { useState, useEffect } from "react";
import { 
  GraduationCap, Calendar, ChevronRight, FileText, 
  Trash2, Loader2, Search, CheckCircle2, HelpCircle, AlertTriangle 
} from "lucide-react";
import API from "../services/apiClient";
import Layout from "../components/Layout.jsx";
import { toast, ToastContainer } from "react-toastify";


export default function QuizHistoryPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ MODAL STATE FOR CENTERED DELETE
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

  // ✅ TRIGGER MODAL
  const openDeleteModal = (e, quizId) => {
    e.stopPropagation();
    e.preventDefault();
    setItemToDelete(quizId);
    setIsModalOpen(true);
  };

  // ✅ EXECUTE DELETE
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
    (q.pdf?.filename || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-6 md:p-10 animate-in fade-in duration-500 relative">
        <ToastContainer limit={1} containerStyle={{ zIndex: 99999 }} />

        {/* 🔴 CENTERED DELETE MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
              <div className="p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Quiz Record?</h3>
                <p className="text-sm text-slate-500 mb-6">
                  This will permanently remove this quiz from your history. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete} 
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 shadow-lg shadow-red-100 active:scale-95 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl shadow-sm">
              <GraduationCap size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quiz History</h1>
              <p className="text-slate-500 font-medium text-sm">Review your past practice sessions.</p>
            </div>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by document..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Quiz List */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <Loader2 size={32} className="animate-spin text-blue-600" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading History</p>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-20 text-center">
              <HelpCircle className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-400 font-medium">No quiz sessions found.</p>
            </div>
          ) : (
            filteredQuizzes.map((quiz) => (
              <QuizCard key={quiz._id} quiz={quiz} onDelete={openDeleteModal} />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

function QuizCard({ quiz, onDelete }) {
  const quizData = typeof quiz.output === "string" ? JSON.parse(quiz.output) : quiz.output;

  return (
    <details className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-300 transition-all shadow-sm">
      <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">{quiz.pdf?.filename || "Quiz Session"}</h3>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase">
                <Calendar size={14} /> {new Date(quiz.createdAt).toLocaleDateString()}
              </div>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                {quizData.length} Questions
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={(e) => onDelete(e, quiz._id)}
            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={18} />
          </button>
          <ChevronRight className="text-slate-300 group-open:rotate-90 transition-transform" size={20} />
        </div>
      </summary>

      <div className="px-8 pb-8 pt-4 border-t border-slate-50 bg-slate-50/40">
        <div className="space-y-8">
          {quizData.map((q, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex gap-4">
                <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {idx + 1}
                </span>
                <div className="space-y-4 flex-1">
                  <p className="text-slate-800 font-bold leading-relaxed pt-1">{q.question}</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {q.options.map((opt, optIdx) => (
                      <div 
                        key={optIdx} 
                        className={`p-3 rounded-xl border text-sm font-medium flex items-center gap-3 ${
                          opt === q.correctAnswer ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-100 text-slate-500"
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${opt === q.correctAnswer ? "bg-emerald-400" : "bg-slate-300"}`} />
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



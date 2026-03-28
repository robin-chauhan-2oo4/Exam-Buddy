import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Target, AlertCircle, Sparkles, ChevronDown, ChevronUp, Trash2, Library } from "lucide-react";
import API from "../../services/apiClient";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ProbableQuestionsTab({ pdfId }) {
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isElaborating, setIsElaborating] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState("");
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/ai/probable-questions/history/${pdfId}`);
        if (res.data.history && res.data.history.length > 0) {
          // Combine all historical predictions into one massive study list
          const allQuestions = res.data.history.flatMap(h => h.output);
          setQuestions(allQuestions);
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };
    if (pdfId) loadHistory();
  }, [pdfId]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError("");
    try {
      const existing = questions ? questions.map(q => q.question) : [];
      await API.post("/ai/probable-questions", { pdfId, existingQuestions: existing });
      
      // Reload history to grab the newly generated ones and combine with old ones
      const res = await API.get(`/ai/probable-questions/history/${pdfId}`);
      if (res.data.history && res.data.history.length > 0) {
        const allQuestions = res.data.history.flatMap(h => h.output);
        setQuestions(allQuestions);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to generate questions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (idx, e) => {
    e.stopPropagation();
    const confirmed = window.confirm("Are you sure you want to delete this question from your study list?");
    if (!confirmed) return;

    const newQuestions = [...questions];
    newQuestions.splice(idx, 1);
    setQuestions(newQuestions);
    
    if (expandedIndex === idx) setExpandedIndex(null);

    try {
      await API.put("/ai/probable-questions", { pdfId, updatedQuestions: newQuestions });
    } catch (err) {
      console.error("Failed to update on delete", err);
    }
  };

  const handleElaborate = async (idx, questionObj) => {
    setIsElaborating(idx);
    setError("");
    try {
      const res = await API.post("/ai/probable-questions/elaborate", { 
        pdfId, 
        question: questionObj.question,
        currentAnswer: questionObj.suggestedAnswer
      });
      
      const newQuestions = [...questions];
      newQuestions[idx].suggestedAnswer = res.data.answer;
      setQuestions(newQuestions);

      await API.put("/ai/probable-questions", { pdfId, updatedQuestions: newQuestions });
    } catch (err) {
      console.error("Failed to elaborate", err);
      setError(err.response?.data?.message || "Failed to elaborate answer.");
    } finally {
      setIsElaborating(null);
    }
  };

  const getImportanceColor = (importance) => {
    switch (importance?.toLowerCase()) {
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "medium":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "low":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full pb-20 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Probable Exam Questions
          </h2>
          <p className="mt-1" style={{ color: "var(--text-muted)" }}>
            Generate the most likely questions to appear on your exam based on this document.
          </p>
        </div>
        <motion.button
          onClick={handleGenerate}
          disabled={isGenerating || loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-white font-semibold disabled:opacity-50 transition-all shadow-lg shrink-0"
          style={{
            background: "linear-gradient(135deg, #ef4444, #f97316)",
          }}
        >
          {isGenerating ? <Loader2 className="animate-spin" size={18} /> : (questions && questions.length > 0 ? <Sparkles size={18} /> : <Target size={18} />)}
          <span className="hidden sm:inline">{isGenerating ? "Analyzing..." : (questions && questions.length > 0 ? "Generate More" : "Predict Questions")}</span>
          <span className="sm:hidden">{isGenerating ? "..." : (questions && questions.length > 0 ? "+ Generate" : "Predict")}</span>
        </motion.button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 p-4 rounded-xl bg-red-500/10">
          <AlertCircle size={18} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {(!questions || questions.length === 0) && !loading && !isGenerating && (
           <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
            style={{ color: "var(--text-muted)" }}
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
              <Target size={40} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Predict Your Exam</h3>
            <p className="max-w-md">Let our AI scan the document and predict the most highly probable exam questions so you can target your studying.</p>
          </motion.div>
        )}

        {loading && !isGenerating && (
          <motion.div
             key="loading"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="flex flex-col items-center justify-center py-24 text-center"
           >
             <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
             <p style={{ color: "var(--text-muted)" }}>Loading your predicted questions...</p>
           </motion.div>
        )}

        {isGenerating && (
          <motion.div
             key="generating"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="flex flex-col items-center justify-center py-24 text-center"
           >
             <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
             <p style={{ color: "var(--text-muted)" }}>Analyzing document depth and structure...</p>
           </motion.div>
        )}

        {questions && questions.length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 pt-4"
          >
            {questions.map((q, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl transition-all"
                style={{
                  background: "var(--bg-surface)",
                  border: expandedIndex === idx ? "1px solid var(--accent)" : "1px solid var(--border-color)",
                }}
              >
                <div 
                  className="p-5 flex gap-4 cursor-pointer items-start"
                  onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <span className={"text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border " + getImportanceColor(q.importance)}>
                         {q.importance} Probability
                       </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-bold" style={{ color: "var(--text-primary)" }}>{q.question}</h4>
                  </div>
                  <div className="flex items-center gap-2 mt-1 shrink-0" style={{ color: "var(--text-muted)" }}>
                    <button 
                      onClick={(e) => handleDelete(idx, e)} 
                      className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors"
                      title="Delete Question"
                    >
                      <Trash2 size={18} />
                    </button>
                    {expandedIndex === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedIndex === idx && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-5 pb-5 pt-2"
                    >
                      <div className="p-4 rounded-xl" style={{ background: "var(--bg-background)", border: "1px solid var(--border-light)" }}>
                        <div className="flex items-center justify-between gap-2 mb-3">
                           <div className="font-bold text-sm flex items-center gap-2" style={{ color: "var(--accent)" }}>
                              <Library size={16} /> Answer Key
                           </div>
                           <button
                             onClick={() => handleElaborate(idx, q)}
                             disabled={isElaborating === idx}
                             className="text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                             style={{ background: "var(--bg-input)", color: "var(--text-secondary)" }}
                           >
                             {isElaborating === idx ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                             {isElaborating === idx ? "Elaborating..." : "Ask AI to Elaborate"}
                           </button>
                        </div>
                        <div className="prose prose-sm prose-invert max-w-none text-sm normalized-text" style={{ color: "var(--text-secondary)" }}>
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              table: ({ node, ...props }) => (
                                <div className="overflow-x-auto my-4 rounded-lg" style={{ border: '1px solid var(--border-color)' }}>
                                  <table className="min-w-full divide-y" style={{ borderColor: 'var(--border-color)' }} {...props} />
                                </div>
                              ),
                              thead: ({ node, ...props }) => <thead style={{ background: 'var(--bg-surface)' }} {...props} />,
                              tbody: ({ node, ...props }) => <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }} {...props} />,
                              th: ({ node, ...props }) => <th className="px-3 py-2 text-left text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }} {...props} />,
                              td: ({ node, ...props }) => <td className="px-3 py-2 text-sm" style={{ color: 'var(--text-secondary)' }} {...props} />,
                            }}
                          >
                            {q.suggestedAnswer}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

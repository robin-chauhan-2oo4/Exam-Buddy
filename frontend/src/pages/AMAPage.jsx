import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, User, Loader2, Sparkles, ShieldCheck,
  History, Search, MessageSquare, Trash2, Plus, AlertTriangle, X, PanelLeftOpen,
} from "lucide-react";
import API from "../services/apiClient";
import ReactMarkdown from "react-markdown";
import Layout from "../components/Layout.jsx";
import { toast } from "react-toastify";
export default function AMAPage() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "I'm your general AI tutor. You can ask me anything—math, history, coding, or study tips!" },
  ]);
  const [amaHistory, setAmaHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false); // mobile history panel
  const [activeSessionId, setActiveSessionId] = useState(null);
  const scrollRef = useRef(null);

  const groupSessions = (historyList) => {
    const map = new Map();
    historyList.forEach((item) => {
      const sid = item.sessionId || item._id;
      if (!map.has(sid)) {
        map.set(sid, {
          _id: sid,
          title: item.input, 
          createdAt: item.createdAt,
          messages: [],
        });
      }
      map.get(sid).messages.unshift({ role: "user", text: item.input });
      map.get(sid).messages.unshift({ role: "ai", text: item.output });
    });
    
    return Array.from(map.values()).map(sess => ({
      ...sess,
      title: sess.messages.find(m => m.role === "user")?.text || "Chat Session"
    }));
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setFetchingHistory(true);
        const res = await API.get("/ai/ama/history");
        const grouped = groupSessions(res.data.history || []);
        setAmaHistory(grouped);
      } catch (err) {
        console.error("AMA History Error:", err);
      } finally {
        setFetchingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSelectHistory = (item) => {
    setMessages(item.messages);
    setActiveSessionId(item._id);
    setHistoryOpen(false);
  };
  
  const handleNewSession = () => {
    setMessages([{ role: "ai", text: "New session started. Ask me anything!" }]);
    setActiveSessionId(Date.now().toString());
  };

  const openDeleteModal = (e, historyId) => {
    e.stopPropagation();
    setItemToDelete(historyId);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsModalOpen(false);
    const statusId = toast.loading("Removing chat...");
    try {
      await API.delete(`/ai/history/${itemToDelete}`);
      setAmaHistory((prev) => prev.filter((h) => h._id !== itemToDelete));
      toast.update(statusId, { render: "Deleted successfully", type: "success", isLoading: false, autoClose: 2000 });
      if (activeSessionId === itemToDelete) {
        handleNewSession();
      }
    } catch (err) {
      toast.update(statusId, { render: "Failed to delete record", type: "error", isLoading: false, autoClose: 2000 });
    } finally {
      setItemToDelete(null);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      let currentSessionId = activeSessionId;
      if (!currentSessionId) {
        currentSessionId = Date.now().toString();
        setActiveSessionId(currentSessionId);
      }
      const res = await API.post("/ai/ama", { question: userMsg, sessionId: currentSessionId });
      setMessages((prev) => [...prev, { role: "ai", text: res.data.answer }]);
      
      const newRecord = { _id: Date.now().toString(), sessionId: currentSessionId, input: userMsg, output: res.data.answer, createdAt: new Date() };
      
      setAmaHistory((prev) => {
        // Find existing session
        const existingIdx = prev.findIndex(p => p._id === currentSessionId);
        if (existingIdx >= 0) {
          const updated = [...prev];
          const sess = updated[existingIdx];
          sess.messages = [...sess.messages, { role: "user", text: userMsg }, { role: "ai", text: res.data.answer }];
          return updated;
        } else {
          return [{
            _id: currentSessionId,
            title: userMsg,
            createdAt: new Date(),
            messages: [{ role: "user", text: userMsg }, { role: "ai", text: res.data.answer }]
          }, ...prev];
        }
      });
    } catch (err) {
      toast.error("AI connection failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = amaHistory.filter((h) =>
    h.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)] w-full overflow-hidden rounded-2xl relative"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        {/* Delete Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.4)' }}
                onClick={() => setIsModalOpen(false)}
              />
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="relative rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
              >
                <div className="p-6 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4"
                    style={{ background: 'var(--danger-bg)', color: 'var(--danger-text)' }}
                  >
                    <AlertTriangle size={24} />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Delete Chat Record?</h3>
                  <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                    This action cannot be undone. This question will be permanently removed.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                    >Cancel</button>
                    <button onClick={confirmDelete}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 shadow-lg active:scale-95"
                    >Delete</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar: History */}
        <div className="hidden md:flex w-72 flex-col shrink-0"
          style={{ borderRight: '1px solid var(--border-light)', background: 'var(--bg-surface)' }}
        >
          <HistoryPanel
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            fetchingHistory={fetchingHistory}
            filteredHistory={filteredHistory}
            handleSelectHistory={handleSelectHistory}
            openDeleteModal={openDeleteModal}
            handleNewSession={handleNewSession}
          />
        </div>

        {/* Mobile History Overlay */}
        <AnimatePresence>
          {historyOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[80] md:hidden backdrop-blur-sm"
                style={{ background: 'rgba(0,0,0,0.4)' }}
                onClick={() => setHistoryOpen(false)}
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="fixed left-0 top-0 bottom-0 w-72 z-[90] md:hidden flex flex-col"
                style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border-color)' }}
              >
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>AMA History</span>
                  <button onClick={() => setHistoryOpen(false)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                    <X size={18} />
                  </button>
                </div>
                  <HistoryPanel
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    fetchingHistory={fetchingHistory}
                    filteredHistory={filteredHistory}
                    handleSelectHistory={handleSelectHistory}
                    openDeleteModal={openDeleteModal}
                    handleNewSession={handleNewSession}
                    hideHeader
                  />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Chat Window */}
        <div className="flex-1 flex flex-col min-w-0" style={{ background: 'var(--bg-card)' }}>
          <div className="px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between shrink-0"
            style={{ borderBottom: '1px solid var(--border-light)' }}
          >
            <div className="flex items-center gap-3">
              {/* Mobile history toggle */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setHistoryOpen(true)}
                className="p-2 rounded-lg md:hidden"
                style={{ color: 'var(--text-muted)' }}
              >
                <PanelLeftOpen size={20} />
              </motion.button>

              <div className="p-2 rounded-xl text-white shadow-lg shrink-0"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                <Bot size={18} className="sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>
                  Ask Me Anything
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-widest items-center gap-1 hidden sm:flex"
                  style={{ color: 'var(--success-text)' }}
                >
                  <ShieldCheck size={12} /> Global Knowledge Base
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8 space-y-6 sm:space-y-8 custom-scrollbar" style={{ background: 'var(--bg-surface)' }}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: Math.min(i * 0.03, 0.3) }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-2 sm:gap-4 max-w-[92%] sm:max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                      msg.role === "user" ? "text-white" : ""
                    }`}
                    style={{
                      background: msg.role === "user"
                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                        : 'var(--bg-card)',
                      border: msg.role === "user" ? 'none' : '1px solid var(--border-color)',
                      color: msg.role === "user" ? '#fff' : 'var(--accent)',
                    }}
                  >
                    {msg.role === "user" ? <User size={14} /> : <Sparkles size={14} />}
                  </motion.div>
                  <div className="px-3 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-[13px] sm:text-[14px] leading-relaxed shadow-sm"
                    style={{
                      background: msg.role === "user"
                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                        : 'var(--bg-card)',
                      color: msg.role === "user" ? '#fff' : 'var(--text-primary)',
                      border: msg.role === "user" ? 'none' : '1px solid var(--border-light)',
                      borderTopRightRadius: msg.role === "user" ? 0 : undefined,
                      borderTopLeftRadius: msg.role !== "user" ? 0 : undefined,
                    }}
                  >
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="flex justify-start"
              >
                <div className="flex gap-3 items-center px-4 sm:px-5 py-3 rounded-2xl rounded-tl-none shadow-sm"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}
                >
                  <div className="loading-dots">
                    <span /><span /><span />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    Searching Knowledge...
                  </span>
                </div>
              </motion.div>
            )}
            <div ref={scrollRef} />
          </div>

          <div className="p-3 sm:p-4 md:p-6 shrink-0" style={{ borderTop: '1px solid var(--border-light)', background: 'var(--bg-card)' }}>
            <form onSubmit={handleSend}
              className="max-w-4xl mx-auto flex items-center gap-2 rounded-2xl p-1.5 transition-all shadow-sm"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
              }}
            >
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="Ask any subject question..."
                className="flex-1 bg-transparent px-3 sm:px-4 py-2 sm:py-2.5 outline-none text-sm font-semibold min-w-0"
                style={{ color: 'var(--text-primary)' }}
                disabled={loading}
              />
              <motion.button
                type="submit"
                disabled={!input.trim() || loading}
                whileHover={{ scale: 1.08, rotate: -5 }}
                whileTap={{ scale: 0.92 }}
                className="text-white p-2 sm:p-2.5 rounded-xl shadow-lg disabled:opacity-50 shrink-0"
                style={{
                  background: 'var(--accent)',
                  boxShadow: '0 4px 16px var(--accent-shadow)',
                  transition: 'box-shadow 0.3s ease',
                }}
              >
                <Send size={18} />
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Extracted history panel to reuse for desktop and mobile
function HistoryPanel({ searchTerm, setSearchTerm, fetchingHistory, filteredHistory, handleSelectHistory, openDeleteModal, handleNewSession, hideHeader }) {
  return (
    <>
      {!hideHeader && (
        <div className="p-4 shrink-0" style={{ borderBottom: '1px solid var(--border-light)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History size={16} style={{ color: 'var(--text-muted)' }} />
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                AMA History
              </h3>
            </div>
            <button
              onClick={handleNewSession}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--accent)' }}
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2" size={14} style={{ color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search history..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl text-xs focus:ring-2 transition-all outline-none"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid transparent',
                color: 'var(--text-primary)',
                '--tw-ring-color': 'var(--accent-light)',
              }}
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {fetchingHistory ? (
          <div className="flex justify-center pt-10">
            <Loader2 size={16} className="animate-spin" style={{ color: 'var(--accent)' }} />
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-4 text-center text-[10px] uppercase font-bold tracking-widest mt-4"
            style={{ color: 'var(--text-muted)' }}
          >
            No History
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div key={item._id} className="group relative">
              <button onClick={() => handleSelectHistory(item)}
                className="w-full text-left p-3 rounded-xl transition-all border border-transparent"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--bg-card)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare size={12} style={{ color: 'var(--accent)' }} />
                  <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>
                    {new Date(item.createdAt).toLocaleDateString()} • {item.messages.length} msgs
                  </span>
                </div>
                <p className="text-[11px] line-clamp-2 leading-snug" style={{ color: 'var(--text-secondary)' }}>
                  {item.title}
                </p>
              </button>
              <button onClick={(e) => openDeleteModal(e, item._id)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 transition-all"
                style={{ color: 'var(--text-muted)' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}

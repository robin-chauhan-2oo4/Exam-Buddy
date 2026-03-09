import { useState, useRef, useEffect } from "react";
import { 
  Send, Bot, User, Loader2, Sparkles, ShieldCheck, 
  History, Search, MessageSquare, Trash2, Plus, AlertTriangle 
} from "lucide-react";
import API from "../services/apiClient";
import ReactMarkdown from "react-markdown";
import Layout from "../components/Layout.jsx";
import { toast, ToastContainer } from "react-toastify";


export default function AMAPage() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "I'm your general AI tutor. You can ask me anything—math, history, coding, or study tips!" }
  ]);
  const [amaHistory, setAmaHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);

  // ✅ MODAL STATE FOR CENTERED DELETE
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setFetchingHistory(true);
        const res = await API.get("/ai/ama/history");
        setAmaHistory(res.data.history || []);
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
    setMessages([
      { role: "user", text: item.input },
      { role: "ai", text: item.output }
    ]);
  };

  // ✅ ENHANCED: TRIGGER CENTERED MODAL
  const openDeleteModal = (e, historyId) => {
    e.stopPropagation();
    setItemToDelete(historyId);
    setIsModalOpen(true);
  };

  // ✅ ENHANCED: EXECUTE DELETE WITH BLUR BACKDROP
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsModalOpen(false);
    const statusId = toast.loading("Removing chat...");
    try {
      await API.delete(`/ai/history/${itemToDelete}`);
      setAmaHistory(prev => prev.filter(h => h._id !== itemToDelete));
      toast.update(statusId, { render: "Deleted successfully", type: "success", isLoading: false, autoClose: 2000 });
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
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await API.post("/ai/ama", { question: userMsg });
      setMessages(prev => [...prev, { role: "ai", text: res.data.answer }]);
      
      const newRecord = {
        _id: Date.now().toString(),
        input: userMsg,
        output: res.data.answer,
        createdAt: new Date()
      };
      setAmaHistory(prev => [newRecord, ...prev]);
    } catch (err) {
      toast.error("AI connection failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = amaHistory.filter(h => 
    h.input.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex h-[calc(100vh-140px)] w-full bg-white border border-slate-200 shadow-sm overflow-hidden rounded-2xl relative">
        <ToastContainer limit={1} containerStyle={{ zIndex: 99999 }} />

        {/* 🔴 ENHANCED: CENTERED DELETE MODAL (Same as ChatTab) */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-white/30 animate-in fade-in duration-300"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
              <div className="p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Chat Record?</h3>
                <p className="text-sm text-slate-500 mb-6">This action cannot be undone. This question will be permanently removed.</p>
                <div className="flex gap-3">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                  <button onClick={confirmDelete} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 shadow-lg shadow-red-100 active:scale-95">Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Sidebar: History --- */}
        <div className="w-72 border-r border-slate-100 bg-slate-50/50 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History size={16} className="text-slate-500" />
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest">AMA History</h3>
              </div>
              <button 
                onClick={() => setMessages([{ role: "ai", text: "New session started. Ask me anything!" }])}
                className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input type="text" placeholder="Search history..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-100 border-transparent rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {fetchingHistory ? (
              <div className="flex justify-center pt-10"><Loader2 size={16} className="animate-spin text-blue-600" /></div>
            ) : filteredHistory.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-4">No History</div>
            ) : (
              filteredHistory.map((item) => (
                <div key={item._id} className="group relative">
                  <button onClick={() => handleSelectHistory(item)}
                    className="w-full text-left p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare size={12} className="text-blue-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-snug">{item.input}</p>
                  </button>
                  <button onClick={(e) => openDeleteModal(e, item._id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- Main Chat Window --- */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl text-white shadow-lg"><Bot size={20} /></div>
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">Ask Me Anything</h3>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-1">
                  <ShieldCheck size={12} /> Global Knowledge Base
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-slate-50/20">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-4 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border mt-1 shadow-sm ${
                    msg.role === "user" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-blue-600"
                  }`}>
                    {msg.role === "user" ? <User size={14} /> : <Sparkles size={14} />}
                  </div>
                  <div className={`px-5 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                    msg.role === "user" ? "bg-blue-600 text-white rounded-tr-none shadow-blue-100" : "bg-white border border-slate-100 text-slate-800 rounded-tl-none"
                  }`}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-3 items-center bg-white border border-slate-100 px-5 py-3 rounded-2xl rounded-tl-none shadow-sm">
                  <Loader2 size={16} className="animate-spin text-blue-600" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Searching Knowledge...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          <div className="p-6 bg-white border-t border-slate-100">
            <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-2 bg-slate-100 rounded-2xl p-1.5 border border-slate-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 transition-all shadow-sm">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask any subject question..."
                className="flex-1 bg-transparent px-4 py-2.5 outline-none text-sm font-semibold" disabled={loading} />
              <button type="submit" disabled={!input.trim() || loading} className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 disabled:opacity-50 transition-all">
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}



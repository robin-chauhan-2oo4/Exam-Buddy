import { useState, useRef, useEffect } from "react";
import { 
  Send, Bot, User, Loader2, Sparkles, 
  History, MessageSquare, Trash2, ShieldCheck, Plus, Search, X, AlertTriangle 
} from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API = axios.create({ baseURL: "https://exam-buddy-a88x.onrender.com/api" });
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default function ChatTab({ pdfId }) {
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  
  // ✅ MODAL STATE
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const scrollRef = useRef(null);

  useEffect(() => {
    const loadFullHistory = async () => {
      try {
        setFetchingHistory(true);
        const res = await API.get(`/ai/history/${pdfId}`);
        const chatSessions = res.data.history || [];
        
        if (chatSessions.length > 0) {
          const formatted = chatSessions.flatMap(h => [
            { role: "user", text: h.input },
            { role: "ai", text: h.output }
          ]);
          setMessages(formatted);
          setChatHistory([...chatSessions].reverse()); 
        } else {
          setMessages([{ role: "ai", text: "Hi! How can I help you with this PDF today?" }]);
        }
      } catch (error) {
        console.error("Frontend History Error:", error);
      } finally {
        setFetchingHistory(false);
      }
    };
    if (pdfId) loadFullHistory();
  }, [pdfId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const groupHistoryByDate = (history) => {
    const groups = { Today: [], Yesterday: [], Older: [] };
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;

    history.forEach(item => {
      const itemDate = new Date(item.createdAt).getTime();
      if (itemDate >= today) groups.Today.push(item);
      else if (itemDate >= yesterday) groups.Yesterday.push(item);
      else groups.Older.push(item);
    });
    return groups;
  };

  const handleSelectHistory = (item) => {
    setMessages([{ role: "user", text: item.input }, { role: "ai", text: item.output }]);
  };

  // ✅ TRIGGER MODAL
  const openDeleteModal = (e, historyId) => {
    e.stopPropagation();
    setItemToDelete(historyId);
    setIsModalOpen(true);
  };

  // ✅ EXECUTE DELETE
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsModalOpen(false);
    const statusId = toast.loading("Removing chat...");
    try {
      await API.delete(`/ai/history/${itemToDelete}`);
      setChatHistory(prev => prev.filter(item => item._id !== itemToDelete));
      toast.update(statusId, { render: "Deleted successfully", type: "success", isLoading: false, autoClose: 2000 });
    } catch (error) {
      toast.update(statusId, { render: "Failed to delete record", type: "error", isLoading: false, autoClose: 2000 });
    } finally {
      setItemToDelete(null);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput(""); 
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);
    try {
      const res = await API.post("/ai/chat", { pdfId, question: userMessage });
      setMessages((prev) => [...prev, { role: "ai", text: res.data.answer }]);
      setChatHistory(prev => [{ _id: Date.now().toString(), input: userMessage, output: res.data.answer, createdAt: new Date() }, ...prev]);
    } catch (error) {
      toast.error("Failed to connect to AI");
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = chatHistory.filter(item => 
    item.input.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-220px)] w-full bg-white border border-slate-200 shadow-sm overflow-hidden rounded-2xl relative">
      <ToastContainer limit={1} />

      {/* 🔴 DELETE MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <div 
            className="absolute inset-0 bg-white/30 animate-in fade-in duration-300"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-6 text-center">
              <div className="mx-auto w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Chat Record?</h3>
              <p className="text-sm text-slate-500 mb-6">
                This action cannot be undone. This question will be permanently removed from your history.
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
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 shadow-lg shadow-red-100 transition-all active:scale-95"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Sidebar --- */}
      <div className="w-72 border-r border-slate-100 bg-slate-50/50 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Chat History</h3>
            <button onClick={() => setMessages([{ role: "ai", text: "New session started." }])} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
              <Plus size={18}/>
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-9 pr-3 py-2 bg-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-5 custom-scrollbar">
          {Object.entries(groupHistoryByDate(filteredHistory)).map(([label, items]) => (
            items.length > 0 && (
              <div key={label}>
                <h4 className="px-3 mb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</h4>
                <div className="space-y-1">
                  {items.map((item) => (
                    <div key={item._id} className="group relative">
                      <button 
                        onClick={() => handleSelectHistory(item)} 
                        className="w-full text-left p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all"
                      >
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed font-medium">{item.input}</p>
                      </button>
                      <button 
                        onClick={(e) => openDeleteModal(e, item._id)} 
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* --- Main Chat Section --- */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><Bot size={18}/></div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Study Assistant</h3>
              <p className="text-[10px] text-emerald-600 font-bold uppercase flex items-center gap-1"><ShieldCheck size={10} /> Grounded</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 bg-slate-50/20">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-4 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${msg.role === "user" ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-blue-600"}`}>
                  {msg.role === "user" ? <User size={14}/> : <Sparkles size={14}/>}
                </div>
                <div className={`px-5 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm ${msg.role === "user" ? "bg-blue-600 text-white rounded-tr-none shadow-blue-100" : "bg-white border border-slate-100 text-slate-800 rounded-tl-none"}`}>
                  <ReactMarkdown components={{ p: ({node, ...props}) => <p {...props} className="mb-0 font-medium" /> }}>{msg.text}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 items-center bg-white border border-slate-100 w-fit px-5 py-3 rounded-2xl shadow-sm">
              <Loader2 size={14} className="animate-spin text-blue-600"/>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thinking...</span>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <div className="p-6 bg-white border-t border-slate-100">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-3 bg-slate-100 rounded-2xl p-1.5 border border-slate-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 transition-all shadow-sm">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Ask a question..." 
              className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none font-semibold" 
              disabled={loading} 
            />
            <button 
              type="submit" 
              disabled={!input.trim() || loading} 
              className={`p-3 rounded-xl transition-all ${!input.trim() || loading ? "text-slate-300" : "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:scale-105 active:scale-95"}`}
            >
              <Send size={18}/>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

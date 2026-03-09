import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom"; // 👈 Added useLocation
import axios from "axios";
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  Loader2, 
  MessageSquare 
} from "lucide-react";

import Layout from "../components/Layout";
import DocumentTabs from "../components/DocumentTabs";

// Import your Tab Components
import SummaryTab from "../components/tabs/SummaryTab"; 
import FlashcardsTab from "../components/tabs/FlashcardsTab";
import QuizTab from "../components/tabs/QuizTab";
import ChatTab from "../components/tabs/ChatTab";

// --- API Configuration ---
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default function DocumentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // 👈 Initialize location hook
  
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary"); // Default to Summary

  // 1. Load Document Data
  useEffect(() => {
    async function loadDocument() {
      try {
        setLoading(true);
        const res = await API.get(`/pdf/${id}`);
        setDocument(res.data.pdf);
      } catch (error) {
        console.error("Failed to load document", error);
      } finally {
        setLoading(false);
      }
    }
    loadDocument();
  }, [id]);

  // 2. 👇 Handle Tab Switching from Dashboard Navigation 👇
  useEffect(() => {
    // If the previous page sent us a specific tab request, use it!
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-slate-400">
          <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
          <p>Loading document...</p>
        </div>
      </Layout>
    );
  }

  if (!document) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-xl font-bold text-slate-800">Document not found</h2>
          <button 
            onClick={() => navigate("/documents")} 
            className="mt-4 text-blue-600 hover:underline"
          >
            Go back to library
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 px-4 py-6">
        
        {/* --- Top Navigation Bar --- */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="space-y-4 w-full">
            <button 
              onClick={() => navigate("/documents")}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Documents
            </button>
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl hidden sm:flex items-center justify-center shrink-0">
                <FileText size={32} />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-tight truncate">
                  {document.originalName || document.filename}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 mt-2">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span>Uploaded on {new Date(document.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="hidden sm:inline">•</span>
                  <span>{Math.max(1, Math.round((document.extractedText?.length || 0) / 3000))} min read</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Tab Navigation --- */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm pt-2 border-b border-slate-100">
          <DocumentTabs active={activeTab} onChange={setActiveTab} />
        </div>

        {/* --- Tab Content Area --- */}
        <div className="min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500 py-4">
          {activeTab === "summary" && <SummaryTab pdfId={id} />}
          {activeTab === "flashcards" && <FlashcardsTab pdfId={id} />}
          {activeTab === "quiz" && <QuizTab pdfId={id} />}
          {activeTab === "chat" && <ChatTab pdfId={id} />}
        </div>

      </div>
    </Layout>
  );
}

// --- Placeholder for Chat Tab ---
function ChatTabPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
      <div className="p-4 bg-white shadow-sm rounded-full mb-4">
        <MessageSquare size={32} className="text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700">AI Chat</h3>
      <p className="text-slate-500">Chat with this document feature is coming soon.</p>
    </div>
  );
}
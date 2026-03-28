import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/apiClient";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Loader2,
  MessageSquare,
} from "lucide-react";

import Layout from "../components/Layout";
import DocumentTabs from "../components/DocumentTabs";

import SummaryTab from "../components/tabs/SummaryTab";
import FlashcardsTab from "../components/tabs/FlashcardsTab";
import QuizTab from "../components/tabs/QuizTab";
import ChatTab from "../components/tabs/ChatTab";
import ProbableQuestionsTab from "../components/tabs/ProbableQuestionsTab";

export default function DocumentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");

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

  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]" style={{ color: 'var(--text-muted)' }}>
          <Loader2 size={40} className="animate-spin mb-4" style={{ color: 'var(--accent)' }} />
          <p>Loading document...</p>
        </div>
      </Layout>
    );
  }

  if (!document) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Document not found</h2>
          <button
            onClick={() => navigate("/documents")}
            className="mt-4 hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            Go back to library
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-7xl mx-auto space-y-4 sm:space-y-6"
      >
        {/* Top Navigation Bar */}
        <div className="flex flex-col gap-4 pb-4 sm:pb-6"
          style={{ borderBottom: '1px solid var(--border-color)' }}
        >
          <div className="space-y-4 w-full">
            <button
              onClick={() => navigate("/documents")}
              className="flex items-center gap-2 text-sm font-medium transition-colors group"
              style={{ color: 'var(--text-muted)' }}
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Documents
            </button>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl hidden sm:flex items-center justify-center shrink-0"
                style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
              >
                <FileText size={32} />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-tight break-words"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {document.originalName || document.filename}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
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

        {/* Tab Navigation */}
        <div className="sticky top-0 z-20 pt-2 backdrop-blur-sm"
          style={{ borderBottom: '1px solid var(--border-light)' }}
        >
          <DocumentTabs active={activeTab} onChange={setActiveTab} />
        </div>

        {/* Tab Content Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-[500px] py-4"
        >
          {activeTab === "summary" && <SummaryTab pdfId={id} />}
          {activeTab === "flashcards" && <FlashcardsTab pdfId={id} />}
          {activeTab === "quiz" && <QuizTab pdfId={id} />}
          {activeTab === "probable" && <ProbableQuestionsTab pdfId={id} />}
          {activeTab === "chat" && <ChatTab pdfId={id} />}
        </motion.div>
      </motion.div>
    </Layout>
  );
}

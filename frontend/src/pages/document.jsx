import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  FileText,
  Filter,
  Loader2,
} from "lucide-react";
import Layout from "../components/Layout";
import { getUserPDFs, deletePDF } from "../services/pdf.api";
import { generateSummary, getSummaryHistory } from "../services/summary.api";
import DocumentCard from "../components/DocumentCard";
import UploadDocumentModal from "../components/UploadDocumentModal";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openUpload, setOpenUpload] = useState(false);

  const [generatingId, setGeneratingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await getUserPDFs();
      setDocuments(res.data.pdfs || []);
    } catch (error) {
      console.error("Failed to load docs", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async (pdfId) => {
    if (!pdfId) return;
    setGeneratingId(pdfId);
    try {
      await generateSummary(pdfId);
      setDocuments((prev) =>
        prev.map((d) => (d._id === pdfId ? { ...d, hasSummary: true } : d))
      );
      alert("Summary Generated!");
    } catch (error) {
      console.error("Summary generation failed", error);
      alert("Failed to generate summary. The server returned an error.");
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDelete = async (pdfId) => {
    try {
      await deletePDF(pdfId);
      setDocuments((prev) => prev.filter((doc) => doc._id !== pdfId));
    } catch (error) {
      alert("Failed to delete document");
    }
  };

  const handleViewSummary = async (pdfId) => {
    try {
      const res = await getSummaryHistory(pdfId);
      if (res.data?.history?.[0]) {
        navigate(`/document/${pdfId}/summary/${res.data.history[0]._id}`, { state: { summary: res.data.history[0].output } });
      } else {
        alert("No summary found. Click 'Generate' first.");
      }
    } catch (error) {
      console.error("Load summary failed", error);
    }
  };

  const filteredDocs = documents.filter((doc) =>
    doc.filename?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 sm:space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Documents
            </h1>
            <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
              Manage and study your uploaded materials.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setOpenUpload(true)}
            className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-medium transition-all w-full sm:w-auto justify-center"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 4px 15px var(--accent-shadow)',
            }}
          >
            <Plus size={20} />
            <span>Upload Document</span>
          </motion.button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 sm:gap-4 p-2 rounded-xl"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div className="flex-1 flex items-center gap-3 px-3">
            <Search size={20} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by filename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border-none focus:outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
          <div className="h-6 w-px" style={{ background: 'var(--border-color)' }} />
          <button className="p-2 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}>
            <Filter size={18} />
          </button>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 size={32} className="animate-spin mb-4" style={{ color: 'var(--accent)' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading your library...</p>
          </div>
        ) : filteredDocs.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredDocs.map((doc, index) => (
              <motion.div
                key={doc._id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
                }}
              >
                <DocumentCard
                  doc={doc}
                  onOpenDocument={() => navigate(`/document/${doc._id}`)}
                  onGenerateSummary={handleGenerateSummary}
                  onViewSummary={handleViewSummary}
                  onDelete={handleDelete}
                  generating={generatingId === doc._id}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl"
            style={{
              background: 'var(--bg-card)',
              border: '2px dashed var(--border-color)',
            }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'var(--bg-surface)' }}
            >
              <FileText size={32} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              No documents found
            </h3>
            <button
              onClick={() => setOpenUpload(true)}
              className="font-medium hover:underline mt-2"
              style={{ color: 'var(--accent)' }}
            >
              Upload a document
            </button>
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <UploadDocumentModal
        open={openUpload}
        onClose={() => setOpenUpload(false)}
        onSuccess={() => {
          loadDocuments();
          setOpenUpload(false);
        }}
      />
    </Layout>
  );
}

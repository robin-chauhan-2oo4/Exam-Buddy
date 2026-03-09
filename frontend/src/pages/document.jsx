// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Layout from "../components/Layout";
// import { getUserPDFs, deletePDF } from "../services/pdf.api";
// import { generateSummary, getSummaryHistory } from "../services/summary.api";
// import DocumentCard from "../components/DocumentCard";
// import UploadDocumentModal from "../components/UploadDocumentModal";
// import SummaryModal from "../components/SummaryModal";

// export default function Documents() {
//   const [documents, setDocuments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [openUpload, setOpenUpload] = useState(false);

//   const [openSummary, setOpenSummary] = useState(false);
//   const [activeSummary, setActiveSummary] = useState("");

//   const [generatingPdfId, setGeneratingPdfId] = useState(null);

//   const navigate = useNavigate();

//   const openDocument = (id) => {
//     navigate(`/document/${id}`);
//   };

//   const loadDocuments = async () => {
//     try {
//       const res = await getUserPDFs();
//       setDocuments(res.data.pdfs);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadDocuments();
//   }, []);

//   // Generate Summary
//   const handleGenerateSummary = async (pdfId) => {
//     try {
//       setGeneratingPdfId(pdfId);
//       await generateSummary(pdfId);

//       // mark summary exists
//       setDocuments((prev) =>
//         prev.map((d) => (d._id === pdfId ? { ...d, hasSummary: true } : d)),
//       );

//       alert("Summary generated successfully");
//     } catch {
//       alert("Failed to generate summary");
//     } finally {
//       setGeneratingPdfId(null);
//     }
//   };

//   const handleDelete = async (pdfId) => {
//     const confirm = window.confirm(
//       "Are you sure you want to delete this document?",
//     );
//     if (!confirm) return;

//     try {
//       await deletePDF(pdfId);

//       // remove from UI immediately
//       setDocuments((prev) => prev.filter((doc) => doc._id !== pdfId));
//     } catch {
//       alert("Failed to delete document");
//     }
//   };

//   // View Summary
//   const handleViewSummary = async (pdfId) => {
//     try {
//       const res = await getSummaryHistory(pdfId);

//       if (!res.data.history || res.data.history.length === 0) {
//         alert("No summary found. Generate one first.");
//         return;
//       }

//       setActiveSummary(res.data.history[0].output);
//       setOpenSummary(true);

//       // ensure badge shows
//       setDocuments((prev) =>
//         prev.map((d) => (d._id === pdfId ? { ...d, hasSummary: true } : d)),
//       );
//     } catch {
//       alert("Failed to load summary");
//     }
//   };

//   return (
//     <Layout>
//       {/* Header */}
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           marginBottom: 24,
//         }}>
//         <div>
//           <h1 style={{ color: "white", fontSize: 24 }}>Documents</h1>
//           <p style={{ color: "#9ca3af" }}>All your uploaded study materials</p>
//         </div>

//         <button
//           onClick={() => setOpenUpload(true)}
//           style={{
//             background: "#10b981",
//             color: "white",
//             padding: "10px 14px",
//             borderRadius: 10,
//             border: "none",
//             cursor: "pointer",
//           }}>
//           + Upload Document
//         </button>
//       </div>

//       {/* Grid */}
//       {loading ?
//         <p style={{ color: "#9ca3af" }}>Loading documents...</p>
//       : <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
//             gap: 20,
//           }}>
//           {documents.map((doc) => (
//             <DocumentCard
//               key={doc._id}
//               doc={doc}
//               onOpenDocument={openDocument}
//               onGenerateSummary={handleGenerateSummary}
//               onViewSummary={handleViewSummary}
//               onDelete={handleDelete}
//               generating={generatingPdfId === doc._id}
//             />
//           ))}
//         </div>
//       }

//       {/* Upload Modal */}
//       <UploadDocumentModal
//         open={openUpload}
//         onClose={() => setOpenUpload(false)}
//         onSuccess={loadDocuments}
//       />

//       {/* Summary Modal */}
//       <SummaryModal
//         open={openSummary}
//         onClose={() => setOpenSummary(false)}
//         summary={activeSummary}
//       />
//     </Layout>
//   );
// }

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Search, 
  FileText, 
  Filter, 
  Loader2 
} from "lucide-react";
import Layout from "../components/Layout";
import { getUserPDFs, deletePDF } from "../services/pdf.api";
import { generateSummary, getSummaryHistory } from "../services/summary.api";
import DocumentCard from "../components/DocumentCard";
import UploadDocumentModal from "../components/UploadDocumentModal";
import SummaryModal from "../components/SummaryModal";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openUpload, setOpenUpload] = useState(false);

  // Summary State
  const [openSummary, setOpenSummary] = useState(false);
  const [activeSummary, setActiveSummary] = useState("");
  
  // Track which specific card is loading
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
    if (!pdfId) return; // Guard clause
    
    setGeneratingId(pdfId);
    try {
      // API call expects a string ID
      await generateSummary(pdfId);
      
      // Update UI to show summary badge
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
    if (!window.confirm("Delete this document? This cannot be undone.")) return;
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
        setActiveSummary(res.data.history[0].output);
        setOpenSummary(true);
      } else {
        alert("No summary found. Click 'Generate' first.");
      }
    } catch (error) {
      console.error("Load summary failed", error);
    }
  };

  // Filter documents based on search
  const filteredDocs = documents.filter(doc => 
    doc.filename?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Documents</h1>
            <p className="text-slate-500 mt-1">Manage and study your uploaded materials.</p>
          </div>

          <button
            onClick={() => setOpenUpload(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
          >
            <Plus size={20} />
            <span>Upload Document</span>
          </button>
        </div>

        {/* --- Toolbar --- */}
        <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm max-w-2xl">
          <div className="flex-1 flex items-center gap-3 px-3">
            <Search size={20} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by filename..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border-none focus:outline-none text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
            <Filter size={18} />
          </button>
        </div>

        {/* --- Content Grid --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 size={32} className="animate-spin mb-4 text-blue-500" />
            <p>Loading your library...</p>
          </div>
        ) : filteredDocs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocs.map((doc) => (
              <DocumentCard 
                key={doc._id}
                doc={doc}
                onOpenDocument={() => navigate(`/document/${doc._id}`)}
                onGenerateSummary={handleGenerateSummary}
                onViewSummary={handleViewSummary}
                onDelete={handleDelete}
                // Pass true only if this specific doc is generating
                generating={generatingId === doc._id}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <FileText size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No documents found</h3>
            <button
              onClick={() => setOpenUpload(true)}
              className="text-blue-600 font-medium hover:underline mt-2"
            >
              Upload a document
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <UploadDocumentModal
        open={openUpload}
        onClose={() => setOpenUpload(false)}
        onSuccess={() => {
          loadDocuments();
          setOpenUpload(false);
        }}
      />

      <SummaryModal
        open={openSummary}
        onClose={() => setOpenSummary(false)}
        summary={activeSummary}
      />
    </Layout>
  );
}
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, FileText, Download, FileDown, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

import Layout from "../components/Layout";
import { getPDFById } from "../services/pdf.api";
import { getSummaryHistory } from "../services/summary.api";

export default function SummaryViewPage() {
  const { id, summaryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [documentInfo, setDocumentInfo] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingDoc, setDownloadingDoc] = useState(false);

  // We use this ref for html2canvas and word innerHTML
  const contentRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const docRes = await getPDFById(id);
        const fetchedDoc = docRes.data.pdf;
        setDocumentInfo(fetchedDoc);

        if (location.state?.summary) {
          setSummary(location.state.summary);
        } else {
          const histRes = await getSummaryHistory(id);
          const histories = histRes.data.history || [];
          const currentSummary = histories.find((h) => h._id === summaryId);
          if (currentSummary) {
            setSummary(currentSummary.output);
          } else {
            setSummary("### Summary not found.");
          }
        }
      } catch (error) {
        console.error("Failed to load summary view", error);
        setSummary("### Failed to load summary.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, summaryId, location.state]);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    setDownloadingPDF(true);
    try {
      // Create a temporary off-screen container to capture the light-theme version 
      // of the text so it doesn't flash or affect the user's current screen theme.
      const printContainer = document.createElement("div");
      printContainer.setAttribute("data-theme", "light");
      printContainer.style.position = "absolute";
      printContainer.style.left = "-9999px";
      printContainer.style.top = "0";
      printContainer.style.width = "900px"; // Provide fixed width for nice PDF wrapping
      printContainer.style.backgroundColor = "#ffffff";
      printContainer.style.padding = "40px";

      const clone = contentRef.current.cloneNode(true);
      printContainer.appendChild(clone);
      document.body.appendChild(printContainer);

      // Give browser a moment to compute the CSS variables on the cloned element
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(printContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      // Clean up the offscreen container
      document.body.removeChild(printContainer);

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      // First page
      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      // Extra pages
      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${documentInfo?.originalName || 'Summary'}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF.");
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleDownloadDoc = () => {
    if (!contentRef.current) return;
    setDownloadingDoc(true);
    try {
      const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>Summary</title>
            <style>
              body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #000; padding: 20px;}
              * { color: #000000; }
              h1 { font-size: 24px; font-weight: bold; margin-top: 24px; margin-bottom: 12px; }
              h2 { font-size: 20px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; }
              h3 { font-size: 16px; font-weight: bold; margin-top: 16px; margin-bottom: 8px; }
              p { margin-bottom: 12px; }
              ul, ol { margin-bottom: 12px; padding-left: 20px; }
              li { margin-bottom: 4px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; }
              pre, code { background-color: #f5f5f5; color: #333; padding: 4px; border-radius: 4px; }
            </style>
            </head><body>`;
      const footer = "</body></html>";
      
      const sourceHTML = header + contentRef.current.innerHTML + footer;
      
      const blob = new Blob(['\ufeff', sourceHTML], {
        type: 'application/msword'
      });
      const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${documentInfo?.originalName || 'Summary'}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch(err) {
        console.error(err);
        alert("Failed to download Word Document.");
    } finally {
      setDownloadingDoc(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]" style={{ color: 'var(--text-muted)' }}>
          <Loader2 size={40} className="animate-spin mb-4" style={{ color: 'var(--accent)' }} />
          <p>Loading summary...</p>
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
        className="max-w-4xl mx-auto space-y-6 px-4 py-6"
      >
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6"
          style={{ borderBottom: '1px solid var(--border-color)' }}
        >
          <div className="space-y-4">
            <button
              onClick={() => navigate(`/document/${id}`, { state: { activeTab: 'summary' } })}
              className="flex items-center gap-2 text-sm font-medium transition-colors group"
              style={{ color: 'var(--text-muted)' }}
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Document
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
              >
                <FileText size={28} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  Generated Summary
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  {documentInfo?.originalName || "Document"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleDownloadDoc}
              disabled={downloadingDoc || downloadingPDF}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all"
              style={{
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}
            >
              {downloadingDoc ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} style={{ color: '#2563eb' }} />}
              Word (.doc)
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloadingPDF || downloadingDoc}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium transition-all shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              }}
            >
              {downloadingPDF ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              PDF
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="rounded-2xl shadow-sm p-6 sm:p-10 font-sans mt-4"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
          }}
        >
          {/* Printable Container */}
          <div
            ref={contentRef}
            className="prose prose-sm sm:prose-base max-w-none break-words normalized-text"
            style={{ color: 'inherit' }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-6">
                    <table className="min-w-full divide-y border" {...props} />
                  </div>
                ),
                thead: ({ node, ...props }) => <thead className="bg-opacity-10 bg-gray-500" {...props} />,
                th: ({ node, ...props }) => <th className="px-4 py-2 text-left font-bold" {...props} />,
                td: ({ node, ...props }) => <td className="px-4 py-2 border-t" {...props} />,
                h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-6 mb-4 leading-tight" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-5 mb-3 leading-tight" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-xl font-bold mt-4 mb-2 leading-tight" {...props} />,
                p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4" {...props} />,
                li: ({ node, ...props }) => <li className="mb-1" {...props} />,
              }}
            >
              {summary}
            </ReactMarkdown>
          </div>
        </div>
      </motion.div>
      
      {/* Global CSS for normalization to ensure standard readable styling */}
      <style>{`
        .normalized-text {
          color: var(--text-primary);
        }
        .normalized-text h1, .normalized-text h2, .normalized-text h3, .normalized-text h4 {
          color: var(--text-primary);
        }
        .normalized-text strong {
          color: var(--text-primary);
        }
        .normalized-text table {
           border-color: var(--border-color);
        }
        .normalized-text th, .normalized-text td {
           border-color: var(--border-color);
        }
      `}</style>
    </Layout>
  );
}

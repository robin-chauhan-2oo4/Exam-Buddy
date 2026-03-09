import { useState, useRef } from "react";
import { UploadCloud, File, X, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
// Import toast if you are using it for notifications
import { toast } from "react-toastify"; 
import { uploadPDF } from "../services/pdf.api.js";

export default function UploadDocumentModal({ open, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  if (!open) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
      setError("");
    } else {
      setError("Please select a valid PDF file.");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await uploadPDF(file);
      
      toast.success("Document analyzed successfully!");
      onSuccess(); // Refresh list
      handleClose(); // Reset and close
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
      toast.error("Failed to upload document.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return; // Prevent closing while uploading
    setFile(null);
    setError("");
    onClose();
  };

  return (
    /* --- 1. FULL PAGE OVERLAY --- */
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      
      {/* --- 2. BACKDROP BLUR --- */}
      <div 
        className="absolute inset-0 bg-white/30 animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* --- 3. MODAL CONTAINER --- */}
      <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Upload New Document</h2>
            <p className="text-sm text-slate-500 mt-0.5">Add a PDF to start your AI study session.</p>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          
          {/* Drop Area */}
          {!file ? (
            <div 
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
            >
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <UploadCloud size={32} />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-700">Click to upload PDF</p>
                <p className="text-sm text-slate-400 mt-1">Maximum file size: 10MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            /* File Preview */
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-between animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="p-3 bg-red-100 text-red-600 rounded-xl shrink-0">
                  <File size={24} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 text-sm font-medium text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 animate-in shake-1">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Security Note */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold uppercase tracking-widest justify-center">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Encrypted & Private Processing</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-0"
          >
            Cancel
          </button>
          
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`
              flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg
              ${!file || loading 
                ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" 
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 hover:-translate-y-0.5 active:scale-95"
              }
            `}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Analyzing PDF...</span>
              </>
            ) : (
              <span>Upload & Analyze</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, File, X, Loader2, AlertCircle, ShieldCheck, Youtube, Link as LinkIcon } from "lucide-react";
import { toast } from "react-toastify";
import { uploadPDF, uploadYouTubeLink } from "../services/pdf.api.js";

export default function UploadDocumentModal({ open, onClose, onSuccess }) {
  const [mode, setMode] = useState("pdf");
  const [youtubeUrl, setYoutubeUrl] = useState("");
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
    if (mode === "pdf") {
      if (!file) {
        setError("Please select a PDF file first.");
        return;
      }
      try {
        setLoading(true);
        setError("");
        await uploadPDF(file);
        toast.success("Document analyzed successfully!");
        onSuccess();
        handleClose();
      } catch (err) {
        console.error(err);
        setError("Upload failed. Please try again.");
        toast.error("Failed to upload document.");
      } finally {
        setLoading(false);
      }
    } else {
      if (!youtubeUrl.trim() || (!youtubeUrl.includes("youtube.com") && !youtubeUrl.includes("youtu.be"))) {
        setError("Please enter a valid YouTube link.");
        return;
      }
      try {
        setLoading(true);
        setError("");
        await uploadYouTubeLink(youtubeUrl);
        toast.success("YouTube video processed successfully!");
        onSuccess();
        handleClose();
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to process video. Make sure English subtitles are available.");
        toast.error("Failed to process YouTube video.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    if (loading) return;
    setFile(null);
    setYoutubeUrl("");
    setError("");
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'rgba(0,0,0,0.4)' }}
        onClick={handleClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border-light)' }}
        >
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Upload New Document</h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Add a PDF to start your AI study session.</p>
          </div>
          <motion.button
            onClick={handleClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full"
            style={{ color: 'var(--text-muted)', transition: 'color 0.2s ease' }}
          >
            <X size={20} />
          </motion.button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          {/* Tabs */}
          <div className="flex bg-[var(--bg-input)] p-1 rounded-xl" style={{ border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => { setMode("pdf"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                mode === "pdf" ? "bg-[var(--bg-card)] shadow-md text-[var(--accent)]" : "text-[var(--text-muted)]"
              }`}
            >
              <File size={16} /> PDF
            </button>
            <button
              onClick={() => { setMode("youtube"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                mode === "youtube" ? "bg-[var(--bg-card)] shadow-md text-[#ef4444]" : "text-[var(--text-muted)]"
              }`}
            >
              <Youtube size={16} /> YouTube
            </button>
          </div>

          {mode === "pdf" ? (
            /* PDF Drop Area */
            !file ? (
            <motion.div
              whileHover={{ scale: 1.01 }}
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
              style={{ borderColor: 'var(--border-color)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300"
                style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
              >
                <UploadCloud size={32} />
              </motion.div>
              <div>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Click to upload PDF</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Maximum file size: 10MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-5 flex items-center justify-between"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
            >
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="p-3 rounded-xl shrink-0"
                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                >
                  <File size={24} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                    {file.name}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </motion.div>
          ) ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-3"
            >
              <label className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>YouTube Link</label>
              <div
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}
              >
                <LinkIcon size={18} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => {
                    setYoutubeUrl(e.target.value);
                    if (error) setError("");
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                Please provide a public YouTube video that has English closed captions enabled.
              </p>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 text-sm font-medium p-4 rounded-xl"
              style={{
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                color: 'var(--danger-text)',
              }}
            >
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Security Note */}
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest justify-center"
            style={{ color: 'var(--text-muted)' }}
          >
            <ShieldCheck size={14} style={{ color: 'var(--success-text)' }} />
            <span>Encrypted & Private Processing</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 flex justify-end gap-3"
          style={{ borderTop: '1px solid var(--border-light)', background: 'var(--bg-surface)' }}
        >
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-bold transition-colors disabled:opacity-0"
            style={{ color: 'var(--text-muted)' }}
          >
            Cancel
          </button>

          <motion.button
            whileHover={{ scale: (!file && mode === "pdf") || loading ? 1 : 1.02 }}
            whileTap={{ scale: (!file && mode === "pdf") || loading ? 1 : 0.98 }}
            onClick={handleUpload}
            disabled={((!file && mode === "pdf") || (!youtubeUrl && mode === "youtube")) || loading}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg ${
              ((!file && mode === "pdf") || (!youtubeUrl && mode === "youtube")) || loading
                ? "cursor-not-allowed opacity-60 shadow-none"
                : ""
            }`}
            style={{
              background: ((!file && mode === "pdf") || (!youtubeUrl && mode === "youtube")) || loading
                ? 'var(--bg-input)'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: ((!file && mode === "pdf") || (!youtubeUrl && mode === "youtube")) || loading ? 'var(--text-muted)' : '#fff',
              boxShadow: ((!file && mode === "pdf") || (!youtubeUrl && mode === "youtube")) || loading ? 'none' : '0 4px 15px var(--accent-shadow)',
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{mode === "pdf" ? "Upload & Analyze" : "Import & Analyze"}</span>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

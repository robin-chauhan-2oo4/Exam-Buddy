import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Calendar, Trash2, AlertTriangle } from "lucide-react";

export default function DocumentCard({ doc, onOpenDocument, onDelete }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const confirmDelete = (e) => {
    e.stopPropagation();
    onDelete(doc._id);
    setIsModalOpen(false);
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -6, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
        onClick={() => onOpenDocument(doc._id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative rounded-2xl p-5 cursor-pointer flex flex-col justify-between h-44 overflow-hidden"
        style={{
          background: 'var(--bg-card)',
          border: `1px solid ${isHovered ? 'var(--accent)' : 'var(--border-color)'}`,
          boxShadow: isHovered ? '0 12px 40px var(--accent-shadow)' : 'none',
          transition: 'border-color 0.3s ease, box-shadow 0.4s ease',
        }}
      >
        {/* Hover gradient overlay */}
        <motion.div
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, transparent, var(--accent-light))',
          }}
        />

        {/* Top accent line */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-0.5"
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
            transformOrigin: 'left',
          }}
        />

        <div className="flex justify-between items-start mb-3 relative z-10">
          <motion.div
            animate={{
              scale: isHovered ? 1.1 : 1,
              rotate: isHovered ? 5 : 0,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="p-3 rounded-xl"
            style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
          >
            <FileText size={28} />
          </motion.div>

          <motion.button
            onClick={handleDeleteClick}
            initial={{ opacity: 0, y: -8 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : -8,
            }}
            whileHover={{ scale: 1.15, color: 'var(--danger-text)' }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="p-2 rounded-lg"
            style={{ color: 'var(--text-muted)' }}
            title="Delete Document"
          >
            <Trash2 size={18} />
          </motion.button>
        </div>

        <div className="space-y-2 relative z-10">
          <h3
            className="font-bold text-lg leading-tight line-clamp-2"
            style={{ color: 'var(--text-primary)' }}
            title={doc.filename}
          >
            {doc.filename}
          </h3>
          <div className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            <Calendar size={14} />
            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </motion.div>

      {/* Delete Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 backdrop-blur-sm"
              style={{ background: 'rgba(0,0,0,0.4)' }}
              onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div className="p-6 text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ background: 'var(--danger-bg)', color: 'var(--danger-text)' }}
                >
                  <AlertTriangle size={24} />
                </motion.div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Delete Document?
                </h3>
                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                  Are you sure you want to delete <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>"{doc.filename}"</span>? This action will permanently remove the document and all associated AI data.
                </p>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold"
                    style={{
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-surface)',
                      transition: 'background 0.2s ease',
                    }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(239, 68, 68, 0.3)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold shadow-lg"
                    style={{ transition: 'box-shadow 0.3s ease' }}
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

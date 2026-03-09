import { useState } from "react";
import { FileText, Calendar, Trash2, AlertTriangle } from "lucide-react";

export default function DocumentCard({ doc, onOpenDocument, onDelete }) {
  const [isHovered, setIsHovered] = useState(false);
  // ✅ MODAL STATE
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Prevent opening the document
    setIsModalOpen(true);
  };

  const confirmDelete = (e) => {
    e.stopPropagation();
    onDelete(doc._id);
    setIsModalOpen(false);
  };

  return (
    <>
      <div
        onClick={() => onOpenDocument(doc._id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between h-auto"
      >
        <div className="flex justify-between items-start mb-3">
          {/* Icon */}
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <FileText size={28} />
          </div>

          {/* Delete Button (Visible on Hover) */}
          <button
            onClick={handleDeleteClick}
            className={`
              p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200
              ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
            `}
            title="Delete Document"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Content Info */}
        <div className="space-y-2">
          <h3
            className="font-bold text-slate-900 text-lg leading-tight line-clamp-2"
            title={doc.filename}
          >
            {doc.filename}
          </h3>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Calendar size={14} />
            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* 🔴 CENTERED DELETE MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop Blur - Click outside to cancel */}
          <div 
            className="absolute inset-0 bg-white/30 animate-in fade-in duration-300"
            onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(false);
            }}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-6 text-center">
              <div className="mx-auto w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Document?</h3>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to delete <span className="font-semibold text-slate-700">"{doc.filename}"</span>? This action will permanently remove the document and all associated AI data.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={(e) => {
                      e.stopPropagation();
                      setIsModalOpen(false);
                  }}
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
    </>
  );
}

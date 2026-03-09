// export default function Modal({ open, onClose, title, children }) {
//   if (!open) return null;

//   return (
//     <div
//       style={{
//         position: "fixed",
//         inset: 0,
//         background: "rgba(0,0,0,0.6)",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         zIndex: 50,
//       }}
//       onClick={onClose}
//     >
//       <div
//         style={{
//           width: 420,
//           background: "#020617",
//           borderRadius: 14,
//           padding: 20,
//           border: "1px solid #1e293b",
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             marginBottom: 16,
//           }}
//         >
//           <h2 style={{ color: "white", fontSize: 18 }}>{title}</h2>
//           <button
//             onClick={onClose}
//             style={{
//               background: "transparent",
//               color: "#94a3b8",
//               border: "none",
//               fontSize: 18,
//               cursor: "pointer",
//             }}
//           >
//             ✕
//           </button>
//         </div>

//         {children}
//       </div>
//     </div>
//   );
// }

import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children }) {
  // Close on "Escape" key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    
    if (open) {
      document.body.style.overflow = "hidden"; // Prevent background scrolling
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- Header --- */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-semibold text-lg text-slate-800 tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- Body --- */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

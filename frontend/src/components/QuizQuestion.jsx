// export default function QuizQuestion({
//   question,
//   options,
//   selected,
//   correct,
//   showReview,
//   onSelect,
// }) {
//   return (
//     <div>
//       <h3 style={{ color: "white", marginBottom: 16 }}>{question}</h3>

//       <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//         {options.map((opt, i) => {
//           let border = "1px solid #1e293b";
//           let bg = "#020617";

//           if (showReview) {
//             if (opt === correct) {
//               border = "2px solid #22c55e";
//               bg = "#052e16";
//             } else if (opt === selected) {
//               border = "2px solid #dc2626";
//               bg = "#450a0a";
//             }
//           } else if (selected === opt) {
//             border = "2px solid #6366f1";
//             bg = "#1e293b";
//           }

//           return (
//             <button
//               key={i}
//               disabled={showReview}
//               onClick={() => onSelect(opt)}
//               style={{
//                 padding: "10px 14px",
//                 borderRadius: 10,
//                 border,
//                 background: bg,
//                 color: "white",
//                 textAlign: "left",
//                 cursor: showReview ? "default" : "pointer",
//               }}>
//               {opt}
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

import { CheckCircle2, XCircle, Circle } from "lucide-react";

export default function QuizQuestion({
  question,
  options,
  selected,
  correct,
  showReview,
  onSelect,
}) {
  return (
    <div className="w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* --- Question Text --- */}
      <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
        {question}
      </h3>

      {/* --- Options List --- */}
      <div className="space-y-3">
        {options.map((opt, i) => {
          // 1. Determine State
          const isSelected = selected === opt;
          const isCorrect = correct === opt;
          
          // 2. Define Styles based on state
          let containerClass = "border-slate-200 hover:border-blue-300 hover:bg-slate-50"; // Default
          let icon = <span className="text-slate-400 font-semibold text-sm">{String.fromCharCode(65 + i)}</span>; // A, B, C...
          let badgeClass = "bg-slate-100 border-slate-200 text-slate-500";

          if (showReview) {
            // --- REVIEW MODE ---
            if (isCorrect) {
              // Correct Answer (Green)
              containerClass = "border-green-500 bg-green-50 ring-1 ring-green-500";
              badgeClass = "bg-green-100 border-green-200 text-green-700";
              icon = <CheckCircle2 size={20} className="text-green-600" />;
            } else if (isSelected && !isCorrect) {
              // Wrong Selection (Red)
              containerClass = "border-red-500 bg-red-50 ring-1 ring-red-500";
              badgeClass = "bg-red-100 border-red-200 text-red-700";
              icon = <XCircle size={20} className="text-red-600" />;
            } else {
              // Irrelevant Option (Dimmed)
              containerClass = "border-slate-100 bg-slate-50/50 opacity-60";
            }
          } else {
            // --- PLAYING MODE ---
            if (isSelected) {
              // Active Selection (Blue)
              containerClass = "border-blue-600 bg-blue-50 ring-1 ring-blue-600 shadow-sm";
              badgeClass = "bg-blue-600 border-blue-600 text-white";
              icon = <CheckCircle2 size={20} className="text-blue-600" />;
            }
          }

          return (
            <button
              key={i}
              disabled={showReview}
              onClick={() => onSelect(opt)}
              className={`
                group w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between
                ${containerClass}
                ${showReview ? "cursor-default" : "cursor-pointer active:scale-[0.99]"}
              `}
            >
              <div className="flex items-center gap-4">
                {/* Letter Badge (A, B, C...) */}
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center border text-sm font-bold transition-colors
                  ${badgeClass}
                `}>
                  {String.fromCharCode(65 + i)}
                </div>

                {/* Option Text */}
                <span className={`font-medium text-lg ${showReview && isCorrect ? "text-green-900 font-bold" : "text-slate-700"}`}>
                  {opt}
                </span>
              </div>

              {/* Status Icon (Right Side) */}
              <div className="pl-4">
                 {showReview ? (
                    isCorrect ? <CheckCircle2 className="text-green-600" /> : 
                    (isSelected ? <XCircle className="text-red-500" /> : null)
                 ) : (
                    isSelected && <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center"><CheckCircle2 size={14} className="text-white" /></div>
                 )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
// import { useState } from "react";

// export default function Flashcard({
//   front,
//   back,
//   onKnown,
//   onUnknown,
//   isKnown,
// }) {
//   const [flipped, setFlipped] = useState(false);

//   return (
//     <div style={{ perspective: "1000px" }}>
//       <div
//         onClick={() => setFlipped(!flipped)}
//         style={{
//           position: "relative",
//           height: 180,
//           transformStyle: "preserve-3d",
//           transition: "transform 0.5s",
//           transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
//           cursor: "pointer",
//         }}
//       >
//         {/* Front */}
//         <div
//           style={{
//             position: "absolute",
//             inset: 0,
//             backfaceVisibility: "hidden",
//             background: "#020617",
//             border: "1px solid #1e293b",
//             borderRadius: 14,
//             padding: 16,
//             color: "white",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             textAlign: "center",
//           }}
//         >
//           {front}
//         </div>

//         {/* Back */}
//         <div
//           style={{
//             position: "absolute",
//             inset: 0,
//             backfaceVisibility: "hidden",
//             transform: "rotateY(180deg)",
//             background: "#0f172a",
//             border: "1px solid #1e293b",
//             borderRadius: 14,
//             padding: 16,
//             color: "#e5e7eb",
//             display: "flex",
//             flexDirection: "column",
//             justifyContent: "space-between",
//             textAlign: "center",
//           }}
//         >
//           <div>{back}</div>

//           {/* Actions */}
//           <div style={{ display: "flex", gap: 8 }}>
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onKnown();
//               }}
//               style={{
//                 flex: 1,
//                 background: "#16a34a",
//                 color: "white",
//                 border: "none",
//                 borderRadius: 8,
//                 padding: "6px",
//                 opacity: isKnown ? 0.6 : 1,
//               }}
//             >
//               Known
//             </button>

//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onUnknown();
//               }}
//               style={{
//                 flex: 1,
//                 background: "#dc2626",
//                 color: "white",
//                 border: "none",
//                 borderRadius: 8,
//                 padding: "6px",
//               }}
//             >
//               Unknown
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState } from "react";
import { Check, X, RotateCw } from "lucide-react";

export default function Flashcard({
  front,
  back,
  onKnown,
  onUnknown,
  isKnown,
}) {
  const [flipped, setFlipped] = useState(false);

  // Toggle flip state
  const handleFlip = () => setFlipped(!flipped);

  return (
    <div 
      className="group perspective-1000 w-full max-w-md mx-auto h-[280px] cursor-pointer"
      onClick={handleFlip}
    >
      <div
        className="relative w-full h-full transition-transform duration-500 transform-style-3d"
        style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        
        {/* --- FRONT FACE --- */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-white border-2 border-slate-200 rounded-2xl shadow-sm group-hover:shadow-md group-hover:border-blue-300 transition-all flex flex-col items-center justify-center p-8 text-center">
          
          <h3 className="text-xl md:text-2xl font-semibold text-slate-800 leading-relaxed">
            {front}
          </h3>
          
          <div className="absolute bottom-4 text-slate-400 text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <RotateCw size={12} />
            <span>Click to flip</span>
          </div>
        </div>

        {/* --- BACK FACE --- */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden bg-slate-50 border-2 border-slate-200 rounded-2xl shadow-sm flex flex-col items-center justify-between p-6 text-center"
          style={{ transform: "rotateY(180deg)" }}
        >
          {/* Answer Content */}
          <div className="flex-1 flex items-center justify-center overflow-y-auto w-full custom-scrollbar">
            <p className="text-lg text-slate-700 font-medium leading-relaxed">
              {back}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="w-full grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnknown();
              }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-white border border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
            >
              <X size={16} />
              Hard
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onKnown();
              }}
              className={`
                flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all shadow-sm
                ${isKnown 
                  ? "bg-green-100 border-green-200 text-green-700" 
                  : "bg-white border-green-100 text-green-600 hover:bg-green-50 hover:border-green-200"
                }
              `}
            >
              <Check size={16} />
              {isKnown ? "Mastered" : "Easy"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
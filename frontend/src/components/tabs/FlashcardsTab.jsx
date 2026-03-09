// import { useEffect, useState } from "react";
// import {
//   generateFlashcards,
//   getFlashcardsHistory,
// } from "../../services/flashcards.api";
// import Flashcard from "../Flashcard";

// export default function FlashcardsTab({ pdfId }) {
//   const [cards, setCards] = useState([]);
//   const [known, setKnown] = useState({});
//   const [loading, setLoading] = useState(false);

//   const loadFlashcards = async () => {
//     const res = await getFlashcardsHistory(pdfId);
//     if (res.data.history.length > 0) {
//       setCards(res.data.history[0].output);
//       setKnown({});
//     }
//   };

//   const handleGenerate = async () => {
//     try {
//       setLoading(true);
//       await generateFlashcards(pdfId);
//       await loadFlashcards();
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🔀 Shuffle cards
//   const shuffleCards = () => {
//     setCards((prev) =>
//       [...prev].sort(() => Math.random() - 0.5)
//     );
//   };

//   // ✅ Progress
//   const knownCount = Object.values(known).filter(Boolean).length;

//   useEffect(() => {
//     loadFlashcards();
//   }, [pdfId]);

//   return (
//     <div>
//       {/* Header */}
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           marginBottom: 16,
//           alignItems: "center",
//         }}
//       >
//         <div>
//           <h2 style={{ color: "white", marginBottom: 4 }}>
//             Flashcards
//           </h2>
//           <p style={{ color: "#9ca3af", fontSize: 13 }}>
//             Progress: {knownCount} / {cards.length} known
//           </p>
//         </div>

//         <div style={{ display: "flex", gap: 8 }}>
//           <button
//             onClick={shuffleCards}
//             style={{
//               background: "#334155",
//               color: "white",
//               padding: "8px 12px",
//               borderRadius: 8,
//               border: "none",
//             }}
//           >
//             Shuffle
//           </button>

//           <button
//             onClick={handleGenerate}
//             disabled={loading}
//             style={{
//               background: "#6366f1",
//               color: "white",
//               padding: "8px 12px",
//               borderRadius: 8,
//               border: "none",
//               opacity: loading ? 0.6 : 1,
//             }}
//           >
//             {loading ? "Generating..." : "Generate"}
//           </button>
//         </div>
//       </div>

//       {/* Cards */}
//       {cards.length === 0 ? (
//         <p style={{ color: "#9ca3af" }}>
//           No flashcards yet. Generate some.
//         </p>
//       ) : (
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
//             gap: 16,
//           }}
//         >
//           {cards.map((card, index) => (
//             <Flashcard
//               key={index}
//               front={card.question || card.front}
//               back={card.answer || card.back}
//               isKnown={known[index]}
//               onKnown={() =>
//                 setKnown((k) => ({ ...k, [index]: true }))
//               }
//               onUnknown={() =>
//                 setKnown((k) => ({ ...k, [index]: false }))
//               }
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { 
  Shuffle, 
  Sparkles, 
  Loader2, 
  BrainCircuit, 
  CheckCircle2 
} from "lucide-react";
import {
  generateFlashcards,
  getFlashcardsHistory,
} from "../../services/flashcards.api";
import Flashcard from "../Flashcard";

export default function FlashcardsTab({ pdfId }) {
  const [cards, setCards] = useState([]);
  const [known, setKnown] = useState({}); // { index: true/false }
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load history on mount
  useEffect(() => {
    loadFlashcards();
  }, [pdfId]);

  const loadFlashcards = async () => {
    setLoading(true);
    try {
      const res = await getFlashcardsHistory(pdfId);
      if (res.data.history.length > 0) {
        // Use the most recent generation
        setCards(res.data.history[0].output);
        setKnown({});
      }
    } catch (error) {
      console.error("Failed to load cards", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generateFlashcards(pdfId);
      await loadFlashcards(); // Reload to get new cards
    } catch (error) {
      alert("Failed to generate flashcards");
    } finally {
      setIsGenerating(false);
    }
  };

  const shuffleCards = () => {
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  // --- Calculations ---
  const knownCount = Object.values(known).filter(Boolean).length;
  const progress = cards.length > 0 ? (knownCount / cards.length) * 100 : 0;

  return (
    <div className="h-full flex flex-col">
      
      {/* --- Header Section --- */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Title & Progress */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <BrainCircuit className="text-blue-500" size={24} />
                Flashcards Deck
              </h2>
              <span className="text-sm font-semibold text-slate-500">
                {knownCount} / {cards.length} Mastered
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={shuffleCards}
              disabled={cards.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <Shuffle size={18} />
              <span className="hidden sm:inline">Shuffle</span>
            </button>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Sparkles size={18} />
              )}
              <span>{isGenerating ? "Generating..." : "Generate New Deck"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- Cards Grid --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
          <p className="text-slate-400 font-medium">Loading your deck...</p>
        </div>
      ) : cards.length === 0 ? (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-12 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
            <BrainCircuit size={32} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">No flashcards yet</h3>
          <p className="text-slate-500 max-w-sm mb-6">
            Generate a deck to start memorizing key concepts from your document.
          </p>
          <button 
            onClick={handleGenerate}
            className="text-blue-600 font-semibold hover:underline"
          >
            Generate now &rarr;
          </button>
        </div>
      ) : (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
          {cards.map((card, index) => (
            <Flashcard
              key={index} // Note: Ideally use a unique ID if available from backend
              front={card.question || card.front}
              back={card.answer || card.back}
              isKnown={known[index]}
              onKnown={() => setKnown((k) => ({ ...k, [index]: true }))}
              onUnknown={() => setKnown((k) => ({ ...k, [index]: false }))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
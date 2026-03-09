import { useEffect, useState } from "react";
import { 
  Sparkles, 
  Clock, 
  FileText, 
  ChevronRight, 
  Loader2, 
  Calendar 
} from "lucide-react";
import {
  generateSummary,
  getSummaryHistory,
} from "../../services/summary.api";
import SummaryModal from "../SummaryModal";

export default function SummaryTab({ pdfId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [activeSummary, setActiveSummary] = useState("");

  const loadSummaries = async () => {
    try {
      const res = await getSummaryHistory(pdfId);
      setHistory(res.data.history || []);
    } catch (error) {
      console.error("Failed to load history", error);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await generateSummary(pdfId);
      await loadSummaries();
    } catch (error) {
      alert("Failed to generate summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummaries();
  }, [pdfId]);

  return (
    // FIX: Removed fixed height (h-[...]) and overflow classes. 
    // This div will now grow naturally with the content.
    <div className="w-full pb-20">
      
      {/* --- Header Section --- */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Summary History</h2>
          <p className="text-slate-500">Track your generated study notes</p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Sparkles size={18} />
          )}
          <span>{loading ? "Generating..." : "New Summary"}</span>
        </button>
      </div>

      {/* --- Timeline List --- */}
      {/* FIX: Removed 'flex-1' and 'overflow-y-auto' */}
      <div>
        {history.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
              <FileText size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No summaries yet</h3>
            <p className="text-slate-500 max-w-xs mt-1">
              Click the "New Summary" button to let AI analyze this document for you.
            </p>
          </div>
        ) : (
          /* History List - Just a normal list now */
          <div className="space-y-4">
            {history.map((item, index) => (
              <div 
                key={item._id}
                onClick={() => {
                  setActiveSummary(item.output);
                  setOpenModal(true);
                }}
                className="group relative bg-white border border-slate-200 rounded-xl p-5 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-200 flex items-center justify-between"
              >
                {/* Timeline Line (Optional visual) */}
                {index !== history.length - 1 && (
                  <div className="absolute left-[29px] top-16 bottom-[-24px] w-px bg-slate-100 -z-10 hidden sm:block"></div>
                )}

                <div className="flex items-start gap-5">
                  {/* Icon Box */}
                  <div className="p-3 text-indigo-600 rounded-xl group-hover:bg-indigo-100 transition-colors z-10 bg-white ring-4 ring-white">
                    <FileText size={24} />
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">
                      Summary Version {history.length - index}
                    </h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        <span>{new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-slate-300 group-hover:text-blue-500 transition-colors self-center">
                  <ChevronRight size={24} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Modal --- */}
      <SummaryModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        summary={activeSummary}
      />
    </div>
  );
}

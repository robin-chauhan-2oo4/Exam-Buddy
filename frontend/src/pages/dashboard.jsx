import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  BookOpen, 
  BrainCircuit, 
  HelpCircle, 
  Clock, 
  Activity,
  ArrowUpRight
} from "lucide-react";
import { getDashboardStats } from "../services/dashboard.api.js";
import Layout from "../components/Layout.jsx";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getDashboardStats();
        if (data) {
          setStats(data.stats || {});
          setActivity(data.recentActivity || []);
        }
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ✅ UPDATED HANDLER: Maps activity type to the correct Tab
  const handleActivityClick = (item) => {
    const pdfId = item.pdf?._id || item.pdf;
    
    if (!pdfId) {
      console.warn("No PDF ID found for this activity:", item);
      return;
    }

    // Determine which tab to open
    let targetTab = "summary"; // Default
    const type = item.type?.toLowerCase() || "";

    if (type.includes("quiz")) {
      targetTab = "quiz"; // Opens Quiz Tab
    } else if (type.includes("flashcard")) {
      targetTab = "flashcards"; // Opens Flashcards Tab
    } else if (type.includes("chat")) {
      targetTab = "chat"; // Opens Chat Tab
    }

    // Navigate and pass the targetTab in state
    navigate(`/document/${pdfId}`, { state: { activeTab: targetTab } });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
          <div className="flex flex-col items-center gap-4 text-slate-500">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-medium animate-pulse">Loading your progress...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 mt-1">Track your learning progress and recent activity.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
            <Clock size={16} />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Documents" 
            value={stats?.totalDocuments || 0} 
            icon={<FileText size={24} className="text-blue-600" />}
            color="bg-blue-50 border-blue-100"
          />
          <StatCard 
            title="Summaries Generated" 
            value={stats?.totalSummaries || 0} 
            icon={<BookOpen size={24} className="text-purple-600" />}
            color="bg-purple-50 border-purple-100"
          />
          <StatCard 
            title="Flashcards Created" 
            value={stats?.totalFlashcards || 0} 
            icon={<BrainCircuit size={24} className="text-amber-600" />}
            color="bg-amber-50 border-amber-100"
          />
          <StatCard 
            title="Quizzes Taken" 
            value={stats?.totalQuizzes || 0} 
            icon={<HelpCircle size={24} className="text-emerald-600" />}
            color="bg-emerald-50 border-emerald-100"
          />
        </div>

        {/* Activity Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <Activity size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
          </div>

          <div className="divide-y divide-slate-100">
            {activity.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <p>No recent activity found. Start by uploading a document!</p>
              </div>
            ) : (
              activity.map((item) => (
                <div 
                  key={item._id} 
                  onClick={() => handleActivityClick(item)}
                  className="group flex items-center justify-between p-6 hover:bg-slate-50 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon based on type */}
                    <div className={`mt-1 p-2 rounded-lg ${getTypeColor(item.type)}`}>
                      {getTypeIcon(item.type)}
                    </div>
                    
                    <div>
                      <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {formatType(item.type)}
                      </p>
                      <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
                        <FileText size={12} />
                        {item.pdf?.filename || "Unknown Document"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {activity.length > 0 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-center">
              <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 mx-auto transition-all hover:gap-2">
                View Full History <ArrowUpRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

// --- Sub-components & Helpers ---

function StatCard({ title, value, icon, color }) {
  return (
    <div className={`p-6 rounded-2xl border transition-transform duration-200 hover:-translate-y-1 ${color}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100/50">
          {icon}
        </div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          All Time
        </span>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
        <p className="text-sm font-medium text-slate-500 mt-1">{title}</p>
      </div>
    </div>
  );
}

// ✅ UPDATED: Added support for 'quiz_attempt'
function getTypeColor(type) {
  const t = type?.toLowerCase() || "";
  if (t.includes('summary')) return 'bg-purple-100 text-purple-600';
  if (t.includes('flashcard')) return 'bg-amber-100 text-amber-600';
  if (t.includes('quiz')) return 'bg-emerald-100 text-emerald-600';
  return 'bg-slate-100 text-slate-600';
}

// ✅ UPDATED: Added support for 'quiz_attempt'
function getTypeIcon(type) {
  const t = type?.toLowerCase() || "";
  if (t.includes('summary')) return <BookOpen size={18} />;
  if (t.includes('flashcard')) return <BrainCircuit size={18} />;
  if (t.includes('quiz')) return <HelpCircle size={18} />;
  return <Activity size={18} />;
}

function formatType(type) {
  if (!type) return "Activity";
  // Replace underscores with spaces (e.g., "Quiz_attempt" -> "Quiz attempt")
  return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " ");
}
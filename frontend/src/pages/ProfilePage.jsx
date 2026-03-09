import { useEffect, useState } from "react";
import axios from "axios";
import { 
  User, Mail, Shield, LogOut, Activity, Zap, Loader2
} from "lucide-react";
import Layout from "../components/Layout";
import { getDashboardStats } from "../services/dashboard.api"; 

// Configure API
const API = axios.create({ baseURL: "http://localhost:5000/api" });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // 1. Fetch Real User Data from DB
        const userRes = await API.get("/auth/me");
        setUser(userRes.data.user);

        // 2. Fetch Dashboard Stats
        const statsRes = await getDashboardStats();
        if (statsRes) setStats(statsRes.stats);
        
      } catch (err) {
        console.error("Failed to load profile", err);
        // Optional: If 401/403, logout automatically
        if (err.response && err.response.status === 401) {
           handleLogout();
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-slate-400 gap-3">
          <Loader2 size={40} className="animate-spin text-blue-500" />
          <p>Loading your profile...</p>
        </div>
      </Layout>
    );
  }

  // If loading finished but no user found
  if (!user) {
     return (
       <Layout>
         <div className="flex flex-col h-[calc(100vh-100px)] items-center justify-center gap-4">
           <p className="text-slate-600 font-medium">Session expired or invalid.</p>
           <button 
             onClick={handleLogout} 
             className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
           >
             Log in again
           </button>
         </div>
       </Layout>
     );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Profile</h1>
          <p className="text-slate-500 mt-1">Manage your account settings and preferences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* User Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold mx-auto border-4 border-white shadow-md mb-4 uppercase">
                 {user.name ? user.name.charAt(0) : "U"}
              </div>
              
              <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
              <p className="text-sm text-slate-500 mb-4">{user.email}</p>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-100">
                <Shield size={12} />
                Free Plan
              </div>
            </div>

            {/* Upgrade Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Zap size={120} /></div>
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-1">Upgrade to Pro</h3>
                <p className="text-slate-300 text-sm mb-4">Get unlimited AI quizzes & storage.</p>
                <button className="w-full py-2 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-100 transition-colors text-sm">View Plans</button>
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Personal Info */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <User size={18} className="text-slate-400" />
                <h3 className="font-semibold text-slate-800">Personal Information</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Full Name</label>
                  <input type="text" defaultValue={user.name} disabled className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400"/>
                    <input type="text" defaultValue={user.email} disabled className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-medium" />
                  </div>
                </div>
              </div>
            </div>

            {/* Study Stats */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <Activity size={18} className="text-slate-400" />
                <h3 className="font-semibold text-slate-800">Learning Activity</h3>
              </div>
              <div className="p-6 grid grid-cols-3 gap-4 text-center">
                 <StatBox label="Documents" value={stats?.totalDocuments || 0} />
                 <StatBox label="Quizzes" value={stats?.totalQuizzes || 0} />
                 <StatBox label="Flashcards" value={stats?.totalFlashcards || 0} />
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-red-50 bg-red-50/30 flex items-center gap-2">
                <LogOut size={18} className="text-red-400" />
                <h3 className="font-semibold text-red-700">Danger Zone</h3>
              </div>
              <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h4 className="font-medium text-slate-900">Sign Out</h4>
                  <p className="text-sm text-slate-500">Securely log out of your session.</p>
                </div>
                <button onClick={handleLogout} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 border border-red-100 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors">
                  <LogOut size={18} /> Log Out
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center h-24">
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs font-medium text-slate-500 uppercase mt-1">{label}</div>
    </div>
  );
}
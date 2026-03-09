import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 👈 Import navigate
import axios from "axios";
import { Search, Bell, LogOut, Menu } from "lucide-react";

// Configure API
const API = axios.create({ baseURL: "http://localhost:5000/api" });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default function Topbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "Student", plan: "Free" });

  useEffect(() => {
    async function fetchUser() {
      try {
        // 1. Fetch real user data from your backend
        const res = await API.get("/auth/me");
        if (res.data.user) {
          setUser({
            name: res.data.user.name,
            plan: res.data.user.plan || "Free", // Default to Free if undefined
          });
        }
      } catch (error) {
        console.error("Failed to fetch user info for Topbar", error);
        // Fallback: Try localStorage if API fails
        const stored = localStorage.getItem("user");
        if (stored) {
            const parsed = JSON.parse(stored);
            setUser({ name: parsed.name || "Student", plan: parsed.plan || "Free" });
        }
      }
    }
    fetchUser();
  }, []);

  const handleLogout = (e) => {
    e.stopPropagation(); // Prevent triggering the profile click
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-40 shadow-sm">
      
      {/* --- Left: Toggle & Title --- */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight hidden sm:block">
            Learning Dashboard
          </h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-600 border border-blue-100 tracking-wide">
            AI Powered
          </span>
        </div>
      </div>

      {/* --- Center: Search Bar --- */}
      <div className="hidden md:flex flex-1 max-w-md mx-8 relative group">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
          size={18}
        />
        <input
          type="text"
          placeholder="Search documents, quizzes..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-slate-400"
        />
      </div>

      {/* --- Right: Profile & Actions --- */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Notification Bell */}
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

        {/* User Profile (Clickable Container) */}
        {/* ✅ ADDED: onClick handler to navigate to profile */}
        <div 
          onClick={() => navigate("/profile")} 
          className="flex items-center gap-3 pl-2 cursor-pointer group p-1 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
              {user.name}
            </span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              {user.plan} Plan
            </span>
          </div>

          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-blue-200 group-hover:scale-105 transition-transform">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
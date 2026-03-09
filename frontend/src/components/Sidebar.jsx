import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  UserCircle,
  LogOut,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Bot, // ✅ Added Bot icon for AMA
} from "lucide-react";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved === "true";
  });

  const [user, setUser] = useState({ name: "Student" });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", isCollapsed);
    // ✅ Dispatch event so Layout knows to resize main content
    window.dispatchEvent(new Event("sidebarToggle"));
  }, [isCollapsed]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  return (
    <aside
      className={`h-screen sticky top-0 bg-white border-r border-slate-200 flex flex-col z-50 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}>
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 relative">
        <div
          className={`flex items-center gap-3 text-blue-600 transition-opacity duration-300 ${
            isCollapsed ? "opacity-0" : "opacity-100"
          }`}>
          <GraduationCap size={28} className="shrink-0" />
          <h2 className="text-xl font-bold tracking-tight text-slate-800 whitespace-nowrap">
            ExamBuddy
          </h2>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 bg-white border border-slate-200 rounded-full p-1 text-slate-400 hover:text-blue-600 shadow-sm hover:bg-blue-50 transition-colors z-50">
          {isCollapsed ?
            <ChevronRight size={16} />
          : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-2">
        <SidebarLink
          to="/dashboard"
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          to="/documents"
          icon={<FileText size={20} />}
          label="Documents"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          to="/quiz-history"
          icon={<GraduationCap size={20} />}
          label="Quiz History"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          to="/ama"
          icon={<Bot size={20} />}
          label="Ask AI (AMA)"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          to="/profile"
          icon={<UserCircle size={20} />}
          label="Profile"
          isCollapsed={isCollapsed}
        />
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-2 bg-slate-50/50">
        {!isCollapsed && (
          <div className="px-2 mb-4 animate-in fade-in duration-500">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
              Logged in as
            </p>
            <p className="text-sm font-semibold text-slate-700 truncate">
              {user.name}
            </p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full p-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group font-medium ${
            isCollapsed ? "justify-center" : "px-4"
          }`}
          title={isCollapsed ? "Sign Out" : ""}>
          <LogOut
            size={20}
            className="shrink-0 group-hover:-translate-x-1 transition-transform"
          />
          {!isCollapsed && <span className="whitespace-nowrap">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

function SidebarLink({ to, icon, label, isCollapsed }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl transition-all duration-200 font-medium group relative ${
          isCollapsed ? "justify-center p-3" : "px-4 py-3"
        } ${
          isActive ?
            "bg-blue-600 text-white shadow-lg shadow-blue-200"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        }`
      }>
      <div className="shrink-0">{icon}</div>
      {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
      {isCollapsed && (
        <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100]">
          {label}
        </div>
      )}
    </NavLink>
  );
}


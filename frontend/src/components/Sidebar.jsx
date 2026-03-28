import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  UserCircle,
  LogOut,
  GraduationCap,
  ChevronRight,
  Bot,
  Sun,
  Moon,
  X,
  CalendarDays,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import GradientText from "./reactbits/GradientText";

export default function Sidebar({ onCloseMobile }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved === "true";
  });

  const [user, setUser] = useState({ name: "Student" });
  const { theme, toggleTheme } = useTheme();

  // When used inside mobile overlay, always show expanded
  const isMobile = !!onCloseMobile;
  const collapsed = isMobile ? false : isCollapsed;

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
    if (!isMobile) {
      localStorage.setItem("sidebarCollapsed", isCollapsed);
      window.dispatchEvent(new Event("sidebarToggle"));
    }
  }, [isCollapsed, isMobile]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="h-screen flex flex-col z-50 shrink-0"
      style={{
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-color)',
      }}
    >
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-5 relative shrink-0"
        style={{ borderBottom: '1px solid var(--border-light)' }}
      >
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3"
            >
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <GraduationCap size={28} style={{ color: 'var(--accent)' }} className="shrink-0" />
              </motion.div>
              <GradientText
                colors={['#6366f1', '#8b5cf6', '#06b6d4', '#6366f1']}
                animationSpeed={8}
                className="text-xl font-bold tracking-tight whitespace-nowrap"
              >
                ExamBuddy
              </GradientText>
            </motion.div>
          )}
        </AnimatePresence>

        {collapsed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto"
          >
            <GraduationCap size={24} style={{ color: 'var(--accent)' }} />
          </motion.div>
        )}

        {/* Mobile close button */}
        {isMobile ? (
          <motion.button
            onClick={onCloseMobile}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 rounded-full"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </motion.button>
        ) : (
          <motion.button
            onClick={() => setIsCollapsed(!isCollapsed)}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="absolute -right-3 top-6 rounded-full p-1 shadow-sm z-50"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
            }}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 0 : 180 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <ChevronRight size={16} />
            </motion.div>
          </motion.button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        <SidebarLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" isCollapsed={collapsed} index={0} onClick={onCloseMobile} />
        <SidebarLink to="/documents" icon={<FileText size={20} />} label="Documents" isCollapsed={collapsed} index={1} onClick={onCloseMobile} />
        <SidebarLink to="/planner" icon={<CalendarDays size={20} />} label="Study Planner" isCollapsed={collapsed} index={2} onClick={onCloseMobile} />
        <SidebarLink to="/quiz-history" icon={<GraduationCap size={20} />} label="Quiz History" isCollapsed={collapsed} index={3} onClick={onCloseMobile} />
        <SidebarLink to="/ama" icon={<Bot size={20} />} label="Ask AI (AMA)" isCollapsed={collapsed} index={4} onClick={onCloseMobile} />
        <SidebarLink to="/profile" icon={<UserCircle size={20} />} label="Profile" isCollapsed={collapsed} index={5} onClick={onCloseMobile} />
      </nav>

      {/* Footer */}
      <div className="p-3 space-y-2 shrink-0" style={{ borderTop: '1px solid var(--border-light)' }}>
        {/* Theme Toggle Button */}
        <motion.button
          onClick={toggleTheme}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center gap-3 w-full p-3 rounded-xl font-medium ${
            collapsed ? "justify-center" : "px-4"
          }`}
          style={{
            background: 'var(--accent-light)',
            color: 'var(--accent)',
            transition: 'background 0.3s ease, color 0.3s ease',
          }}
          title={collapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : ''}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </motion.div>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap text-sm"
              >
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* User info */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="px-2 mb-2 overflow-hidden"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1" style={{ color: 'var(--text-muted)' }}>
                Logged in as
              </p>
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {user.name}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logout */}
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center gap-3 w-full p-3 rounded-xl font-medium ${
            collapsed ? "justify-center" : "px-4"
          }`}
          style={{
            color: 'var(--text-muted)',
            transition: 'color 0.2s ease, background 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--danger-text)';
            e.currentTarget.style.background = 'var(--danger-bg)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.background = 'transparent';
          }}
          title={collapsed ? "Sign Out" : ""}
        >
          <LogOut size={20} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
}

function SidebarLink({ to, icon, label, isCollapsed, index = 0, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl font-medium group relative overflow-hidden ${
          isCollapsed ? "justify-center p-3" : "px-4 py-3"
        }`
      }
      style={({ isActive }) => ({
        background: isActive
          ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
          : 'transparent',
        color: isActive ? '#ffffff' : 'var(--text-secondary)',
        boxShadow: isActive ? '0 4px 15px var(--accent-shadow)' : 'none',
        transition: 'background 0.3s ease, color 0.25s ease, box-shadow 0.3s ease, transform 0.2s ease',
      })}
    >
      {({ isActive }) => (
        <>
          {!isActive && (
            <span
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"
              style={{
                background: 'var(--bg-card-hover)',
                transition: 'opacity 0.25s ease',
              }}
            />
          )}

          {isActive && (
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full" 
              style={{ transition: 'transform 0.7s ease' }}
            />
          )}

          <motion.div
            className="shrink-0 relative z-10"
            whileHover={{ scale: 1.15, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {icon}
          </motion.div>
          
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                className="whitespace-nowrap relative z-10"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>

          {isCollapsed && (
            <div
              className="absolute left-full ml-4 px-3 py-2 text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[100] font-medium shadow-lg"
              style={{
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                transition: 'opacity 0.2s ease',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              {label}
              <span
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 rotate-45"
                style={{ background: 'var(--bg-card)', borderLeft: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}
              />
            </div>
          )}
        </>
      )}
    </NavLink>
  );
}

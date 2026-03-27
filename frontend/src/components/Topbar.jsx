import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import API from "../services/apiClient";
import { Search, Bell, LogOut, Menu, Sun, Moon, FileText, X } from "lucide-react";

export default function Topbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState({ name: "Student", plan: "Free" });

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searching, setSearching] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await API.get("/auth/me");
        if (res.data.user) {
          setUser({
            name: res.data.user.name,
            plan: res.data.user.plan || "Free",
          });
        }
      } catch (error) {
        console.error("Failed to fetch user info for Topbar", error);
        const stored = localStorage.getItem("user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setUser({ name: parsed.name || "Student", plan: parsed.plan || "Free" });
          } catch (e) {}
        }
      }
    }
    fetchUser();
  }, []);

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search — searches documents by filename
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await API.get("/pdf");
        const docs = res.data?.pdfs || [];
        const q = searchQuery.toLowerCase();
        const filtered = docs.filter(doc =>
          (doc.filename || "").toLowerCase().includes(q) ||
          (doc.originalName || "").toLowerCase().includes(q)
        );
        setSearchResults(filtered.slice(0, 6));
      } catch (err) {
        console.error("Search failed:", err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer.current);
  }, [searchQuery]);

  const handleSearchSelect = (doc) => {
    navigate(`/document/${doc._id}`);
    setSearchQuery("");
    setSearchResults([]);
    setSearchFocused(false);
    setMobileSearchOpen(false);
  };

  const handleLogout = (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  const showDropdown = searchFocused && searchQuery.trim().length > 0;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="h-14 sm:h-16 flex items-center justify-between px-3 sm:px-4 sticky top-0 z-40 glass shrink-0"
      style={{
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      {/* Left: Toggle & Title */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <motion.button
          onClick={onToggleSidebar}
          whileTap={{ scale: 0.9 }}
          className="p-2 -ml-1 rounded-lg lg:hidden"
          style={{ color: 'var(--text-muted)' }}
        >
          <Menu size={22} />
        </motion.button>

        <div className="flex items-center gap-2 sm:gap-3">
          <h2 className="text-base sm:text-lg font-bold tracking-tight hidden md:block" style={{ color: 'var(--text-primary)' }}>
            Learning Dashboard
          </h2>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
            className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-wide animate-glow-breathe hidden sm:inline-block"
            style={{
              background: 'var(--accent-light)',
              color: 'var(--accent)',
              border: '1px solid var(--border-color)',
            }}
          >
            AI Powered
          </motion.span>
        </div>
      </div>

      {/* Center: Search Bar (Desktop) */}
      <div ref={searchRef} className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8 relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          size={18}
          style={{
            color: searchFocused ? 'var(--accent)' : 'var(--text-muted)',
            transition: 'color 0.25s ease',
          }}
        />
        <input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          className="w-full pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none"
          style={{
            background: 'var(--bg-input)',
            border: `1px solid ${searchFocused ? 'var(--accent)' : 'var(--border-color)'}`,
            color: 'var(--text-primary)',
            transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
            boxShadow: searchFocused ? 'var(--input-focus-glow)' : 'none',
          }}
        />

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto custom-scrollbar"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
              }}
            >
              {searching ? (
                <div className="px-4 py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((doc) => (
                  <button
                    key={doc._id}
                    onClick={() => handleSearchSelect(doc)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left group"
                    style={{
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div className="p-2 rounded-lg shrink-0" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {doc.originalName || doc.filename}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                        Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  No documents found for "{searchQuery}"
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Mobile Search Toggle */}
        <motion.button
          onClick={() => setMobileSearchOpen(prev => !prev)}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full md:hidden"
          style={{ color: 'var(--text-muted)' }}
        >
          {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
        </motion.button>

        {/* Theme Toggle */}
        <motion.button
          onClick={toggleTheme}
          whileHover={{ scale: 1.15, rotate: 15 }}
          whileTap={{ scale: 0.85, rotate: -15 }}
          className="p-2 rounded-full relative"
          style={{
            color: 'var(--text-muted)',
            transition: 'color 0.2s ease',
          }}
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* Notification Bell */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative p-2 rounded-full hidden sm:flex"
          style={{
            color: 'var(--text-muted)',
            transition: 'color 0.2s ease',
          }}
        >
          <Bell size={20} />
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
            className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"
            style={{
              borderWidth: '2px',
              borderColor: 'var(--bg-surface)',
            }}
          />
        </motion.button>

        <div className="h-6 sm:h-8 w-px hidden sm:block" style={{ background: 'var(--border-color)' }} />

        {/* User Profile */}
        <motion.div
          onClick={() => navigate("/profile")}
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer p-1 rounded-xl"
          style={{ transition: 'background 0.2s ease' }}
        >
          <div className="hidden lg:flex flex-col items-end leading-tight">
            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {user.name}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              {user.plan} Plan
            </span>
          </div>

          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white font-bold shadow-md relative overflow-hidden text-sm"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 4px 12px var(--accent-shadow)',
            }}
          >
            <span className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            <span className="relative z-10">{user.name.charAt(0).toUpperCase()}</span>
          </motion.div>

          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 sm:p-2 rounded-lg hidden sm:block"
            style={{
              color: 'var(--text-muted)',
              transition: 'color 0.2s ease',
            }}
            title="Sign Out"
          >
            <LogOut size={18} />
          </motion.button>
        </motion.div>
      </div>

      {/* Mobile Search Bar — slides down when toggled */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 right-0 top-full z-50 px-3 py-3 md:hidden overflow-hidden"
            style={{
              background: 'var(--bg-surface)',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <div className="relative" ref={searchRef}>
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                size={16}
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              />

              {/* Mobile Search Results */}
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="mt-2 rounded-xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    {searching ? (
                      <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                        Searching...
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((doc) => (
                        <button
                          key={doc._id}
                          onClick={() => handleSearchSelect(doc)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left"
                          style={{ borderBottom: '1px solid var(--border-light)' }}
                        >
                          <FileText size={16} style={{ color: 'var(--accent)' }} className="shrink-0" />
                          <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {doc.originalName || doc.filename}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                        No results found
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

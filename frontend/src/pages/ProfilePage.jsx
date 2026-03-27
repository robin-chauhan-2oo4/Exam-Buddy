import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API from "../services/apiClient";
import {
  User, Mail, Shield, LogOut, Activity, Zap, Loader2
} from "lucide-react";
import Layout from "../components/Layout";
import { getDashboardStats } from "../services/dashboard.api";
import CountUp from "../components/reactbits/CountUp";
import SpotlightCard from "../components/reactbits/SpotlightCard";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const userRes = await API.get("/auth/me");
        setUser(userRes.data.user);
        const statsRes = await getDashboardStats();
        if (statsRes) setStats(statsRes.stats);
      } catch (err) {
        console.error("Failed to load profile", err);
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
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] gap-3">
          <Loader2 size={40} className="animate-spin" style={{ color: 'var(--accent)' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading your profile...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col h-[calc(100vh-100px)] items-center justify-center gap-4">
          <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>
            Session expired or invalid.
          </p>
          <button
            onClick={handleLogout}
            className="px-6 py-2 text-white rounded-lg transition"
            style={{ background: 'var(--accent)' }}
          >
            Log in again
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-5xl mx-auto px-4 py-8 space-y-8"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            My Profile
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* User Card */}
          <div className="space-y-6">
            <div className="rounded-2xl p-6 text-center"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
              <motion.div
                whileHover={{ scale: 1.08, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 250, damping: 15 }}
                className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 uppercase relative overflow-hidden"
                style={{
                  background: 'var(--accent-light)',
                  color: 'var(--accent)',
                  border: '4px solid var(--bg-card)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                {/* Shine overlay */}
                <span className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full" />
                <span className="relative z-10">{user.name ? user.name.charAt(0) : "U"}</span>
              </motion.div>

              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {user.name}
              </h2>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                {user.email}
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--border-color)' }}
              >
                <Shield size={12} />
                Free Plan
              </div>
            </div>

            {/* Upgrade Card */}
            <div className="rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group"
              style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap size={120} />
              </div>
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-1">Upgrade to Pro</h3>
                <p className="text-indigo-200 text-sm mb-4">Get unlimited AI quizzes & storage.</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2 bg-white text-slate-900 font-bold rounded-lg transition-colors text-sm"
                >
                  View Plans
                </motion.button>
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Personal Info */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
              <div className="px-6 py-4 flex items-center gap-2"
                style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-surface)' }}
              >
                <User size={18} style={{ color: 'var(--text-muted)' }} />
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Personal Information</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Full Name</label>
                  <input type="text" defaultValue={user.name} disabled
                    className="w-full px-4 py-2.5 rounded-xl border font-medium"
                    style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-3.5" style={{ color: 'var(--text-muted)' }} />
                    <input type="text" defaultValue={user.email} disabled
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border font-medium"
                      style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Study Stats */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
              <div className="px-6 py-4 flex items-center gap-2"
                style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-surface)' }}
              >
                <Activity size={18} style={{ color: 'var(--text-muted)' }} />
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Learning Activity</h3>
              </div>
              <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <StatBox label="Documents" value={stats?.totalDocuments || 0} />
                <StatBox label="Quizzes" value={stats?.totalQuizzes || 0} />
                <StatBox label="Flashcards" value={stats?.totalFlashcards || 0} />
              </div>
            </div>

            {/* Account Actions */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--danger-border)' }}
            >
              <div className="px-6 py-4 flex items-center gap-2"
                style={{ borderBottom: '1px solid var(--danger-border)', background: 'var(--danger-bg)' }}
              >
                <LogOut size={18} style={{ color: 'var(--danger-text)' }} />
                <h3 className="font-semibold" style={{ color: 'var(--danger-text)' }}>Danger Zone</h3>
              </div>
              <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Sign Out</h4>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Securely log out of your session.</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 border font-medium rounded-xl transition-colors"
                  style={{ borderColor: 'var(--danger-border)', color: 'var(--danger-text)' }}
                >
                  <LogOut size={18} /> Log Out
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}

function StatBox({ label, value }) {
  return (
    <SpotlightCard className="p-4 flex flex-col items-center justify-center h-24">
      <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
        <CountUp to={value} from={0} duration={1.5} />
      </div>
      <div className="text-xs font-medium uppercase mt-1" style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
    </SpotlightCard>
  );
}

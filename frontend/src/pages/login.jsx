import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Loader2,
  LogIn,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { loginUser } from "../services/auth.api";
import GradientText from "../components/reactbits/GradientText";
import BlurText from "../components/reactbits/BlurText";

const floatingParticles = [
  { size: 4, x: '15%', y: '20%', delay: 0, duration: 6 },
  { size: 3, x: '80%', y: '15%', delay: 1, duration: 8 },
  { size: 5, x: '65%', y: '75%', delay: 2, duration: 7 },
  { size: 3, x: '25%', y: '80%', delay: 3, duration: 9 },
  { size: 4, x: '90%', y: '50%', delay: 0.5, duration: 6.5 },
];

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await loginUser(form);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Animated Background Orbs */}
      <div className="auth-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <div className="auth-grid" />

      {/* Floating tiny particles */}
      {floatingParticles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            left: p.x,
            top: p.y,
            background: 'var(--accent)',
            opacity: 0.2,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          className="rounded-3xl overflow-hidden glass"
          style={{
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-card)',
          }}
          whileHover={{
            boxShadow: '0 20px 60px rgba(99, 102, 241, 0.15)',
          }}
          transition={{ duration: 0.4 }}
        >
          {/* Header Section */}
          <div className="p-6 sm:p-8 pb-6 text-center relative overflow-hidden"
            style={{ borderBottom: '1px solid var(--border-light)' }}
          >
            {/* Decorative glow behind icon */}
            <motion.div
              animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full"
              style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
            />
            
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, duration: 0.6, type: "spring", stiffness: 200 }}
              className="inline-flex p-4 rounded-2xl mb-5 relative"
              style={{ background: 'var(--accent-light)' }}
            >
              <GraduationCap size={36} style={{ color: 'var(--accent)' }} />
              <motion.div
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles size={14} className="text-amber-400" />
              </motion.div>
            </motion.div>

            <GradientText
              colors={['#6366f1', '#8b5cf6', '#06b6d4', '#a855f7', '#6366f1']}
              animationSpeed={6}
              className="text-3xl font-bold tracking-tight"
            >
              Welcome Back
            </GradientText>

            <div className="mt-3">
              <BlurText
                text="Sign in to continue your learning journey"
                delay={0.03}
                className="text-sm"
                animateBy="words"
                direction="top"
                animationFrom={{ filter: 'blur(8px)', opacity: 0, y: -10 }}
                animationTo={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
              />
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8 pt-7">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Banner */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95, height: 0 }}
                  animate={{ opacity: 1, y: 0, scale: 1, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, scale: 0.95, height: 0 }}
                  className="p-3 rounded-xl text-sm font-medium text-center"
                  style={{
                    background: 'var(--danger-bg)',
                    border: '1px solid var(--danger-border)',
                    color: 'var(--danger-text)',
                  }}
                >
                  {error}
                </motion.div>
              )}

              {/* Email Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-2"
              >
                <label className="text-sm font-semibold ml-1" style={{ color: 'var(--text-secondary)' }}>
                  Email Address
                </label>
                <div className="relative group">
                  <motion.div
                    animate={{ color: focusedField === 'email' ? 'var(--accent)' : 'var(--text-muted)' }}
                    className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                  >
                    <Mail size={18} />
                  </motion.div>
                  <input
                    type="email"
                    name="email"
                    placeholder="student@example.com"
                    value={form.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border focus:outline-none placeholder:opacity-50"
                    style={{
                      background: 'var(--bg-input)',
                      borderColor: focusedField === 'email' ? 'var(--accent)' : 'var(--border-color)',
                      color: 'var(--text-primary)',
                      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                      boxShadow: focusedField === 'email' ? 'var(--input-focus-glow)' : 'none',
                    }}
                    required
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    Password
                  </label>
                  <a href="#" className="text-xs font-medium hover:underline" style={{ color: 'var(--accent)' }}>
                    Forgot password?
                  </a>
                </div>
                <div className="relative group">
                  <motion.div
                    animate={{ color: focusedField === 'password' ? 'var(--accent)' : 'var(--text-muted)' }}
                    className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                  >
                    <Lock size={18} />
                  </motion.div>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border focus:outline-none placeholder:opacity-50"
                    style={{
                      background: 'var(--bg-input)',
                      borderColor: focusedField === 'password' ? 'var(--accent)' : 'var(--border-color)',
                      color: 'var(--text-primary)',
                      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                      boxShadow: focusedField === 'password' ? 'var(--input-focus-glow)' : 'none',
                    }}
                    required
                  />
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02, y: -2, boxShadow: '0 12px 35px var(--accent-shadow)' }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 text-white rounded-xl font-semibold relative overflow-hidden ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
                  backgroundSize: '200% 200%',
                  animation: 'gradient-shift 4s ease-in-out infinite',
                  transition: 'transform 0.2s ease, box-shadow 0.3s ease',
                }}
              >
                {/* Shimmer overlay */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full hover:translate-x-full"
                  style={{ transition: 'transform 0.8s ease' }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <LogIn size={20} />
                  )}
                  {loading ? "Signing in..." : "Sign In"}
                </span>
              </motion.button>
            </form>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-center pt-6"
              style={{ borderTop: '1px solid var(--border-light)' }}
            >
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold hover:underline"
                  style={{ color: 'var(--accent)', transition: 'color 0.2s ease' }}
                >
                  Create Account
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Trusted by badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 text-center"
        >
          <motion.p
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-xs font-medium"
            style={{ color: 'var(--text-muted)' }}
          >
            ✨ Powered by AI · Study smarter, not harder
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}

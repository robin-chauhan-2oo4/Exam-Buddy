import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";
import GradientText from "../components/reactbits/GradientText";

const floatingParticles = [
  { size: 3, x: '10%', y: '30%', delay: 0, duration: 7 },
  { size: 4, x: '75%', y: '20%', delay: 1, duration: 8 },
  { size: 3, x: '60%', y: '80%', delay: 2, duration: 6 },
];

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Background */}
      <div className="auth-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>

      {/* Floating particles */}
      {floatingParticles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            left: p.x,
            top: p.y,
            background: 'var(--danger-text)',
            opacity: 0.15,
          }}
          animate={{
            y: [-15, 15, -15],
            x: [-8, 8, -8],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-md w-full p-8 rounded-3xl relative z-10 glass"
        style={{
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Icon Animation */}
        <motion.div
          className="relative w-24 h-24 mx-auto mb-6"
          animate={{ y: [0, -8, 0], rotate: [0, 3, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full"
            style={{ background: 'var(--danger-bg)' }}
          />
          <div className="relative w-full h-full rounded-full flex items-center justify-center"
            style={{
              background: 'var(--danger-bg)',
              color: 'var(--danger-text)',
              border: '4px solid var(--bg-card)',
            }}
          >
            <AlertTriangle size={40} />
          </div>
        </motion.div>

        <GradientText
          colors={['#ef4444', '#f97316', '#eab308', '#ef4444']}
          animationSpeed={5}
          className="text-5xl font-extrabold mb-2"
        >
          404
        </GradientText>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-xl font-bold mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          Page Not Found
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mb-8 leading-relaxed"
          style={{ color: 'var(--text-muted)' }}
        >
          Oops! The page you are looking for doesn't exist or has been moved.
        </motion.p>

        <div className="space-y-3">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.03, y: -2, boxShadow: '0 12px 30px var(--accent-shadow)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 4px 15px var(--accent-shadow)',
              transition: 'box-shadow 0.3s ease',
            }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full"
              style={{ transition: 'transform 0.7s ease' }}
            />
            <Home size={18} />
            Go to Dashboard
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              transition: 'box-shadow 0.3s ease',
            }}
          >
            <ArrowLeft size={18} />
            Go Back
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

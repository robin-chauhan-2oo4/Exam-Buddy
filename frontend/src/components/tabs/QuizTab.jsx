import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCcw,
  FileText,
  Trophy,
  Loader2,
  Zap,
} from "lucide-react";
import {
  generateQuiz,
  submitQuizAttempt,
  getQuizReview,
} from "../../services/quiz.api";
import SpotlightCard from "../reactbits/SpotlightCard";

const QUESTION_TIME = 60;

const normalize = (str) => {
  if (!str) return "";
  return String(str).replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
};

export default function QuizTab({ pdfId }) {
  const [quiz, setQuiz] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [mode, setMode] = useState("idle");
  const [reviewData, setReviewData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const question = quiz[current];

  useEffect(() => {
    if (mode !== "playing") return;
    if (timeLeft === 0) { handleNext(true); return; }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, mode]);

  const startQuiz = async () => {
    setMode("loading");
    try {
      const res = await generateQuiz(pdfId);
      setQuiz(res.data.quiz);
      setCurrent(0); setSelected(null); setAnswers([]); setScore(0);
      setTimeLeft(QUESTION_TIME); setMode("playing");
    } catch (err) {
      console.error("Quiz start failed", err); setMode("idle");
    }
  };

  const handleNext = (timeout = false) => {
    const valSelected = normalize(selected);
    const valCorrect = normalize(question?.correctAnswer);
    const isCorrect = !timeout && valSelected === valCorrect;
    if (isCorrect) setScore((s) => s + 1);

    const newAnswer = {
      question: question.question, options: question.options,
      selectedAnswer: timeout ? null : selected, correctAnswer: question.correctAnswer,
      isCorrect, timeTaken: QUESTION_TIME - timeLeft,
    };
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    setSelected(null); setTimeLeft(QUESTION_TIME);

    if (current + 1 === quiz.length) {
      finishQuiz(updatedAnswers, isCorrect ? score + 1 : score);
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const finishQuiz = async (finalAnswers, finalScore) => {
    try {
      setSubmitting(true);
      await submitQuizAttempt({ pdfId, score: finalScore, total: quiz.length, answers: finalAnswers });
      setMode("result");
    } catch (err) {
      console.error("Quiz submit failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  const loadReview = async () => {
    setMode("loading");
    try {
      const res = await getQuizReview(pdfId);
      setReviewData(res.data); setMode("review");
    } catch (err) {
      console.error("Review load failed", err); setMode("result");
    }
  };

  // === Loading ===
  if (mode === "loading") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-[400px] space-y-6"
      >
        <div className="relative">
          <div className="w-16 h-16 border-4 rounded-full animate-spin"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full" style={{ background: 'var(--accent-light)' }} />
          </div>
        </div>
        <p className="font-medium animate-pulse" style={{ color: 'var(--text-muted)' }}>
          {submitting ? "Submitting results..." : "Generating quiz questions..."}
        </p>
      </motion.div>
    );
  }

  // === Idle (Start Screen) ===
  if (mode === "idle") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <SpotlightCard
          className="relative overflow-hidden"
          spotlightColor="rgba(16, 185, 129, 0.15)"
        >
          <div className="flex flex-col items-center justify-center p-12 text-center max-w-2xl mx-auto relative z-10">
            <motion.div
              animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative mb-8"
            >
              <div className="absolute inset-0 rounded-full blur-xl opacity-40 animate-pulse"
                style={{ background: '#10b981', transform: 'scale(1.5)' }}
              />
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center relative shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #34d399)',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
                }}
              >
                <Play size={36} className="text-white ml-1" />
              </div>
            </motion.div>

            <h2 className="text-3xl font-bold mb-3 tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Ready to test your knowledge?
            </h2>
            <p className="text-lg max-w-md mx-auto leading-relaxed mb-10" style={{ color: 'var(--text-muted)' }}>
              Our AI will generate a custom quiz based on this document to help you master the material.
            </p>
            <motion.button
              onClick={startQuiz}
              whileHover={{ scale: 1.05, y: -3, boxShadow: '0 16px 40px rgba(16, 185, 129, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 text-white text-lg rounded-2xl font-bold transition-all relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #10b981, #34d399)',
                boxShadow: '0 8px 30px rgba(16, 185, 129, 0.35)',
              }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="flex items-center gap-2 relative z-10">
                <Zap size={20} />
                Start Quiz Now
              </span>
            </motion.button>

            <div className="absolute top-6 right-8 opacity-[0.03]">
              <Trophy size={180} />
            </div>
          </div>
        </SpotlightCard>
      </motion.div>
    );
  }

  // === Result Screen ===
  if (mode === "result") {
    const accuracy = Math.round((score / quiz.length) * 100);
    const isPassing = accuracy >= 70;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="rounded-3xl overflow-hidden max-w-2xl mx-auto mt-8"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex flex-col items-center p-10 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 rounded-full flex items-center justify-center mb-6 text-4xl font-bold border-4"
            style={{
              background: isPassing ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              borderColor: isPassing ? '#10b981' : '#f59e0b',
              color: isPassing ? '#10b981' : '#f59e0b',
              boxShadow: isPassing ? '0 0 40px rgba(16,185,129,0.2)' : '0 0 40px rgba(245,158,11,0.2)',
            }}
          >
            {accuracy}%
          </motion.div>

          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {isPassing ? "Excellent Work!" : "Keep Practicing!"}
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--text-muted)' }}>
            You scored <strong style={{ color: 'var(--text-primary)' }}>{score}</strong> out of{" "}
            <strong style={{ color: 'var(--text-primary)' }}>{quiz.length}</strong> questions correctly.
          </p>

          <div className="flex gap-4 w-full max-w-sm">
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={startQuiz}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl transition-colors"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
            >
              <RotateCcw size={20} /> Retry
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 8px 24px var(--accent-shadow)' }}
              whileTap={{ scale: 0.97 }}
              onClick={loadReview}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 15px var(--accent-shadow)' }}
            >
              <FileText size={20} /> Review
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  // === Review Screen ===
  if (mode === "review" && reviewData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl overflow-hidden max-w-3xl mx-auto mt-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {reviewData.attempt.answers.map((a, i) => {
            const isActuallyCorrect = normalize(a.selectedAnswer) === normalize(a.correctAnswer);
            return (
              <div
                key={i}
                className="p-5 rounded-2xl border-l-4"
                style={{
                  background: isActuallyCorrect ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                  borderColor: isActuallyCorrect ? '#10b981' : '#ef4444',
                  border: '1px solid var(--border-light)',
                  borderLeftWidth: '4px',
                  borderLeftColor: isActuallyCorrect ? '#10b981' : '#ef4444',
                }}
              >
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold shadow-sm text-white"
                    style={{ background: isActuallyCorrect ? '#10b981' : '#ef4444' }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-3" style={{ color: 'var(--text-primary)' }}>{a.question}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 p-3 rounded-lg"
                        style={{
                          background: isActuallyCorrect ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                          color: isActuallyCorrect ? '#10b981' : '#ef4444',
                        }}
                      >
                        {isActuallyCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                        <span className="font-medium">Your Answer: {a.selectedAnswer || "Time out"}</span>
                      </div>
                      {!isActuallyCorrect && (
                        <div className="flex items-center gap-2 p-3 rounded-lg"
                          style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
                        >
                          <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                          <span>Correct Answer: <span className="font-semibold">{a.correctAnswer}</span></span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  // === Playing State ===
  const progress = ((current + 1) / quiz.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl overflow-hidden max-w-2xl mx-auto mt-4"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* Quiz Header */}
      <div className="px-8 py-5 flex justify-between items-center"
        style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-surface)' }}
      >
        <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Question {current + 1} <span className="mx-1 opacity-50">/</span> {quiz.length}
        </span>
        <motion.div
          animate={timeLeft < 10 ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.5 }}
          className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-mono font-bold"
          style={{
            background: timeLeft < 10 ? 'var(--danger-bg)' : 'var(--accent-light)',
            color: timeLeft < 10 ? 'var(--danger-text)' : 'var(--accent)',
          }}
        >
          <Clock size={16} />
          <span>{timeLeft}s</span>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full" style={{ background: 'var(--bg-input)' }}>
        <motion.div
          className="h-full rounded-r-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
          style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
        />
      </div>

      {/* Question Content */}
      <div className="p-8">
        <AnimatePresence mode="wait">
          <motion.h3
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold mb-8 leading-snug"
            style={{ color: 'var(--text-primary)' }}
          >
            {question.question}
          </motion.h3>
        </AnimatePresence>

        <div className="space-y-3">
          {question.options.map((opt, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.01, x: 4 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelected(opt)}
              className="w-full p-4 pl-5 text-left rounded-2xl border-2 transition-all duration-200 flex items-center justify-between"
              style={{
                borderColor: selected === opt ? 'var(--accent)' : 'var(--border-color)',
                background: selected === opt ? 'var(--accent-light)' : 'var(--bg-card)',
                boxShadow: selected === opt ? '0 4px 16px var(--accent-shadow)' : 'none',
              }}
            >
              <div className="flex items-center gap-4">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
                  style={{
                    background: selected === opt ? 'var(--accent)' : 'var(--bg-surface)',
                    color: selected === opt ? '#fff' : 'var(--text-muted)',
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-lg font-medium" style={{ color: selected === opt ? 'var(--accent)' : 'var(--text-primary)' }}>
                  {opt}
                </span>
              </div>
              {selected === opt && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                  <CheckCircle2 size={24} style={{ color: 'var(--accent)' }} />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quiz Footer */}
      <div className="p-6 flex justify-end"
        style={{ borderTop: '1px solid var(--border-light)', background: 'var(--bg-surface)' }}
      >
        <motion.button
          onClick={() => handleNext()}
          disabled={!selected || submitting}
          whileHover={selected ? { scale: 1.03, boxShadow: '0 8px 24px var(--accent-shadow)' } : {}}
          whileTap={selected ? { scale: 0.97 } : {}}
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-lg transition-all"
          style={{
            background: !selected || submitting ? 'var(--bg-input)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: !selected || submitting ? 'var(--text-muted)' : '#fff',
            boxShadow: !selected || submitting ? 'none' : '0 4px 15px var(--accent-shadow)',
            cursor: !selected || submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {current + 1 === quiz.length ? "Submit Results" : "Next Question"}
          <ChevronRight size={20} />
        </motion.button>
      </div>
    </motion.div>
  );
}

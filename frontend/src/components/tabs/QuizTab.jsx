import { useEffect, useState } from "react";
import {
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCcw,
  FileText,
  Trophy,
} from "lucide-react";
import {
  generateQuiz,
  submitQuizAttempt,
  getQuizReview,
} from "../../services/quiz.api";

const QUESTION_TIME = 60;

// ✅ FIXED: Aggressive Normalizer
// Removes spaces, punctuation, symbols, and case sensitivity for comparison.
const normalize = (str) => {
  if (!str) return "";
  return String(str)
    .replace(/[^a-zA-Z0-9]/g, "") // Remove EVERYTHING except letters & numbers
    .toLowerCase(); // Ignore case
};

export default function QuizTab({ pdfId }) {
  const [quiz, setQuiz] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [mode, setMode] = useState("idle"); // idle | loading | playing | result | review
  const [reviewData, setReviewData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const question = quiz[current];

  /* ================= TIMER ================= */
  useEffect(() => {
    if (mode !== "playing") return;

    if (timeLeft === 0) {
      handleNext(true);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, mode]);

  /* ================= START QUIZ ================= */
  const startQuiz = async () => {
    setMode("loading");
    try {
      const res = await generateQuiz(pdfId);
      setQuiz(res.data.quiz);
      setCurrent(0);
      setSelected(null);
      setAnswers([]);
      setScore(0);
      setTimeLeft(QUESTION_TIME);
      setMode("playing");
    } catch (err) {
      console.error("Quiz start failed", err);
      setMode("idle");
    }
  };

  /* ================= NEXT / SUBMIT ================= */
  const handleNext = (timeout = false) => {
    // 🔍 DEBUGGING: Check your console (F12) if answers are still wrong!
    const valSelected = normalize(selected);
    const valCorrect = normalize(question?.correctAnswer);

    // console.log(`Checking Q${current + 1}:`);
    // console.log(`You chose: "${selected}" -> Normalized: "${valSelected}"`);
    // console.log(
    //   `Correct:   "${question?.correctAnswer}" -> Normalized: "${valCorrect}"`,
    // );

    const isCorrect = !timeout && valSelected === valCorrect;
    // console.log("Result:", isCorrect ? "✅ CORRECT" : "❌ WRONG");

    if (isCorrect) {
      setScore((s) => s + 1);
    }

    const newAnswer = {
      question: question.question,
      options: question.options,
      selectedAnswer: timeout ? null : selected,
      correctAnswer: question.correctAnswer,
      isCorrect,
      timeTaken: QUESTION_TIME - timeLeft,
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    setSelected(null);
    setTimeLeft(QUESTION_TIME);

    if (current + 1 === quiz.length) {
      finishQuiz(updatedAnswers, isCorrect ? score + 1 : score);
    } else {
      setCurrent((c) => c + 1);
    }
  };

  /* ================= FINISH ================= */
  const finishQuiz = async (finalAnswers, finalScore) => {
    try {
      setSubmitting(true);
      const payload = {
        pdfId,
        score: finalScore,
        total: quiz.length,
        answers: finalAnswers,
      };
      await submitQuizAttempt(payload);
      setMode("result");
    } catch (err) {
      console.error("Quiz submit failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= LOAD REVIEW ================= */
  const loadReview = async () => {
    setMode("loading");
    try {
      const res = await getQuizReview(pdfId);
      setReviewData(res.data);
      setMode("review");
    } catch (err) {
      console.error("Review load failed", err);
      setMode("result");
    }
  };

  /* ================= UI STATES ================= */

  // 1. Loading
  if (mode === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-50 rounded-full"></div>
          </div>
        </div>
        <p className="text-slate-500 font-medium animate-pulse">
          {submitting ?
            "Submitting results..."
          : "Generating quiz questions..."}
        </p>
      </div>
    );
  }

  // 2. Idle (Start Screen)
  if (mode === "idle") {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto mt-8">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm transform transition-transform hover:scale-110 duration-300">
          <Play size={36} className="ml-1" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
          Ready to test your knowledge?
        </h2>
        <p className="text-slate-500 mb-10 text-lg max-w-md mx-auto leading-relaxed">
          Our AI will generate a custom quiz based on this document to help you
          master the material.
        </p>
        <button
          onClick={startQuiz}
          className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-xl font-bold shadow-lg shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95">
          Start Quiz Now
        </button>
      </div>
    );
  }

  // 3. Result Screen
  if (mode === "result") {
    const accuracy = Math.round((score / quiz.length) * 100);
    const isPassing = accuracy >= 70;

    return (
      <div className="flex flex-col items-center p-10 bg-white rounded-3xl border border-slate-200 shadow-sm text-center max-w-2xl mx-auto mt-8 animate-in slide-in-from-bottom-8 duration-500">
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 text-4xl font-bold border-8 shadow-inner ${isPassing ? "bg-green-50 border-green-100 text-green-600" : "bg-orange-50 border-orange-100 text-orange-600"}`}>
          {accuracy}%
        </div>

        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          {isPassing ? "Excellent Work!" : "Keep Practicing!"}
        </h2>
        <p className="text-slate-500 mb-8 text-lg">
          You scored <strong className="text-slate-900">{score}</strong> out of{" "}
          <strong className="text-slate-900">{quiz.length}</strong> questions
          correctly.
        </p>

        <div className="flex gap-4 w-full max-w-sm">
          <button
            onClick={startQuiz}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors">
            <RotateCcw size={20} /> Retry
          </button>
          <button
            onClick={loadReview}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5">
            <FileText size={20} /> Review
          </button>
        </div>
      </div>
    );
  }

  // ... (keep your existing imports and helper functions)

  // 4. Review Screen
  if (mode === "review" && reviewData) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden max-w-3xl mx-auto mt-4 animate-in fade-in duration-300">
        {/* ... (Header stays same) ... */}
        
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {reviewData.attempt.answers.map((a, i) => {
            // ✅ FIX: Re-calculate 'isCorrect' using our normalizer
            // This ensures the visual feedback matches your logic, even if backend saved it differently
            const isActuallyCorrect = normalize(a.selectedAnswer) === normalize(a.correctAnswer);

            return (
              <div 
                key={i} 
                className={`p-5 rounded-2xl border-l-4 shadow-sm ${
                  isActuallyCorrect 
                    ? 'bg-green-50/30 border-green-500 ring-1 ring-slate-100' 
                    : 'bg-red-50/30 border-red-500 ring-1 ring-slate-100'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold shadow-sm border ${isActuallyCorrect ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-lg mb-3">{a.question}</h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className={`flex items-center gap-2 p-3 rounded-lg border ${isActuallyCorrect ? 'bg-green-100/50 border-green-200 text-green-800' : 'bg-red-100/50 border-red-200 text-red-800'}`}>
                        {isActuallyCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                        <span className="font-medium">Your Answer: {a.selectedAnswer || "Time out"}</span>
                      </div>
                      
                      {/* Show 'Correct Answer' only if it was ACTUALLY wrong */}
                      {!isActuallyCorrect && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                          <CheckCircle2 size={18} className="text-green-600" />
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
      </div>
    );
  }

  // 5. Playing State (The Quiz)
  const progress = ((current + 1) / quiz.length) * 100;

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden max-w-2xl mx-auto mt-4">
      {/* Quiz Header */}
      <div className="px-8 py-5 bg-slate-50/80 backdrop-blur border-b border-slate-200 flex justify-between items-center">
        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          Question {current + 1} <span className="text-slate-300 mx-1">/</span>{" "}
          {quiz.length}
        </span>
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-mono font-bold transition-colors ${timeLeft < 10 ? "bg-red-100 text-red-600 animate-pulse" : "bg-blue-50 text-blue-600"}`}>
          <Clock size={16} />
          <span>{timeLeft}s</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-100">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out rounded-r-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question Content */}
      <div className="p-8">
        <h3 className="text-2xl font-bold text-slate-900 mb-8 leading-snug">
          {question.question}
        </h3>

        <div className="space-y-3">
          {question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => setSelected(opt)}
              className={`group w-full p-4 pl-5 text-left rounded-2xl border-2 transition-all duration-200 flex items-center justify-between
                ${
                  selected === opt ?
                    "border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-600"
                  : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"
                }`}>
              <div className="flex items-center gap-4">
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${selected === opt ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-blue-500"}`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span
                  className={`text-lg font-medium ${selected === opt ? "text-blue-900" : "text-slate-700"}`}>
                  {opt}
                </span>
              </div>

              {selected === opt && (
                <CheckCircle2
                  size={24}
                  className="text-blue-600 animate-in zoom-in duration-300"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Quiz Footer */}
      <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
        <button
          onClick={() => handleNext()}
          disabled={!selected || submitting}
          className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-lg transition-all shadow-lg
            ${
              !selected || submitting ?
                "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 hover:-translate-y-0.5 active:scale-95"
            }`}>
          {current + 1 === quiz.length ? "Submit Results" : "Next Question"}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

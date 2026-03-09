import API from "./apiClient";


/* =======================
   QUIZ APIs
======================= */
export const generateQuiz = (pdfId) =>
  API.post("/ai/quiz", { pdfId });

export const submitQuizAttempt = (payload) =>
  API.post("/history/quiz/attempt", payload);

export const getQuizReview = (pdfId) =>
  API.get(`/history/quiz/review/${pdfId}`);






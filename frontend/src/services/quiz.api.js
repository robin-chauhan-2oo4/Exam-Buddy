import axios from "axios";

const API = axios.create({
  baseURL: "https://exam-buddy-a88x.onrender.com/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

/* =======================
   QUIZ APIs
======================= */
export const generateQuiz = (pdfId) =>
  API.post("/ai/quiz", { pdfId });

export const submitQuizAttempt = (payload) =>
  API.post("/history/quiz/attempt", payload);

export const getQuizReview = (pdfId) =>
  API.get(`/history/quiz/review/${pdfId}`);



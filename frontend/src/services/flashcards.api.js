import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});



export const generateFlashcards = (pdfId) => {
  return API.post("/ai/flashcards", { pdfId });
};

export const getFlashcardsHistory = (pdfId) => {
  return API.get(`/history/pdf/${pdfId}/flashcards`);
};

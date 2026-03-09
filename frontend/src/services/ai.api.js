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

export const generateSummary = (pdfId) => {
  return API.post("/ai/summary", { pdfId });
};

export const getSummaryHistory = (pdfId) => {
  return API.get(`/history/pdf/${pdfId}/summary`);
};



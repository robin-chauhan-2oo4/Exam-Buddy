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

export const uploadPDF = (file) => {
  const formData = new FormData();
  formData.append("pdf", file);

  return API.post("/pdf/upload", formData);
};

export const getUserPDFs = () => {
  return API.get("/pdf");
};

export const getPDFById = (id) => {
  return API.get(`/pdf/${id}`);
};

export const deletePDF = (id) => {
  return API.delete(`/pdf/${id}`);
};


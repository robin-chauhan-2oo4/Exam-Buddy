import API from "./apiClient";


export const generateSummary = (pdfId) => {
  return API.post("/ai/summary", { pdfId });
};

export const getSummaryHistory = (pdfId) => {
  return API.get(`/history/pdf/${pdfId}/summary`);
};






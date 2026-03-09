import API from "./apiClient";




export const generateFlashcards = (pdfId) => {
  return API.post("/ai/flashcards", { pdfId });
};

export const getFlashcardsHistory = (pdfId) => {
  return API.get(`/history/pdf/${pdfId}/flashcards`);
};




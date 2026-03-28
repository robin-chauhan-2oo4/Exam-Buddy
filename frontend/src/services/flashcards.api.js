import API from "./apiClient";




export const generateFlashcards = (pdfId) => {
  return API.post("/ai/flashcards", { pdfId });
};

export const getFlashcardsHistory = (pdfId) => {
  return API.get(`/flashcards/${pdfId}`);
};

export const reviewFlashcard = (cardId, quality) => {
  return API.put(`/flashcards/${cardId}/review`, { quality });
};




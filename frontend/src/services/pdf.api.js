import API from "./apiClient";


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





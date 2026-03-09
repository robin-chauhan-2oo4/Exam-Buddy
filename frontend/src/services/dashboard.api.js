import API from "./apiClient";

export const getDashboardStats = async () => {
  const res = await API.get("/dashboard");
  return res.data;
};


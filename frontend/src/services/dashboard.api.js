import axios from "axios";

export const getDashboardStats = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get("https://exam-buddy-a88x.onrender.com/api/dashboard", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

import axios from "axios";

const API = axios.create({
  baseURL: "https://exam-buddy-a88x.onrender.com/api",
});

export const loginUser = (data) =>
  API.post("/auth/login", data);

export const registerUser = (data) =>
  API.post("/auth/register", data);

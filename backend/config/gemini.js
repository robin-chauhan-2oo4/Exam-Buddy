import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini client
export const aiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ✅ CONFIRMED WORKING MODEL (from check.js)
export const modelName = "gemini-flash-latest";

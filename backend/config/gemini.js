import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// 1. Gather all available keys from Environment Variables
// You can just add GEMINI_API_KEY_2, etc., to your .env file
const keys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean); 

let currentKeyIndex = 0;

// Initialize the first Gemini client
let activeClient = keys.length > 0 ? new GoogleGenAI({ apiKey: keys[currentKeyIndex] }) : null;

// Expose a getter so the controller always receives the up-to-date active client
export const getAiClient = () => activeClient;

// Expose a function to rotate to the next key
export const rotateApiKey = () => {
  if (keys.length <= 1) return false; // Can't rotate if we only have 1 key
  
  currentKeyIndex = (currentKeyIndex + 1) % keys.length;
  activeClient = new GoogleGenAI({ apiKey: keys[currentKeyIndex] });
  console.log(`Rotated to Gemini API Key #${currentKeyIndex + 1} of ${keys.length}`);
  return true;
};

// Returns total number of configured keys so we know when we've exhausted them
export const getTotalKeys = () => keys.length;

// ✅ CONFIRMED WORKING MODEL
export const modelName = "gemini-flash-latest";
// ✅ FALLBACK MODEL (Cheaper & High Quota)
export const fallbackModel = "gemini-flash-lite-latest";

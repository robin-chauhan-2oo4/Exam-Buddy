// debug-models.js
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log("Checking available models...");

fetch(url)
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      console.error("❌ API Error:", data.error.message);
    } else {
      console.log("✅ Available Models:");
      data.models.forEach(m => {
        // Only show generateContent supported models
        if (m.supportedGenerationMethods.includes("generateContent")) {
           console.log(` - ${m.name.replace("models/", "")}`);
        }
      });
    }
  })
  .catch(err => console.error("Network Error:", err));
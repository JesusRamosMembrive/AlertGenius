import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

let genAI: GoogleGenAI | null = null;

if (API_KEY) {
  genAI = new GoogleGenAI({ apiKey: API_KEY });
}

export const generateAlertContent = async (prompt: string): Promise<string> => {
  if (!genAI) {
    console.warn("Gemini API Key not found. Returning static prompt.");
    return `[Simulated AI Content]: ${prompt}`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // We wrap the user's prompt to specifically ask for email body content
    const enhancedPrompt = `
      You are an automated alert system. 
      Write a short, concise email body (max 100 words) based on the following requirement: 
      "${prompt}".
      Do not include subject lines or placeholders like "[Your Name]". Just the body text.
    `;

    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: enhancedPrompt }] }],
    });

    const text = response.text;
    return text || "No content generated.";
  } catch (error) {
    console.error("Error generating content:", error);
    return `Failed to generate content via AI. Original prompt: ${prompt}`;
  }
};
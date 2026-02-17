
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Project } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_INSTRUCTION = `
You are ForgeAI, an elite full-stack website builder. Your goal is to generate complete, production-ready source code based on user requests.
You must provide:
1. Frontend code using standard HTML, CSS, and Vanilla JavaScript. 
2. Backend code (Node.js/Express preferred) with clear instructions for database connection (MongoDB/PostgreSQL/MySQL).
3. A complete folder structure representation.

Respond ONLY with a JSON object in this format:
{
  "name": "Project Name",
  "description": "Short project description",
  "files": {
    "index.html": "...",
    "style.css": "...",
    "main.js": "...",
    "server.js": "...",
    "README.md": "..."
  }
}

Guidelines:
- Use Tailwind CSS via CDN in HTML for modern styling.
- Use Feather Icons or FontAwesome via CDN.
- Ensure the backend code includes database connection logic.
- Ensure the code is functional and well-commented.
- If the user asks for updates, provide the FULL updated JSON file map.
`;

export const generateWebsite = async (prompt: string, history: { role: string; parts: { text: string }[] }[] = []): Promise<Project> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 4000 }
      },
    });

    const resultText = response.text || '{}';
    return JSON.parse(resultText) as Project;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

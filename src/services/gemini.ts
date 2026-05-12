import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables");
}

const ai = new GoogleGenAI({ apiKey });

export async function aiSearch(query: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: 'user', parts: [{ text: query }] }],
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are PulseHR AI Assistant. Provide helpful, accurate HR and company information based on web results. Keep responses concise and professional. Always prioritize grounding information from Google Search.",
      } as any,
    });

    const text = response.text || "";
    
    // Extract grounding sources
    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const sources = groundingMetadata?.groundingChunks?.map((chunk: any) => chunk.web).filter(Boolean) || [];

    return { text, sources };
  } catch (error) {
    console.error("Gemini Search Error:", error);
    throw error;
  }
}

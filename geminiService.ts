import { GoogleGenAI, Type, Schema } from "@google/genai";

// --- Initialization ---
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Core Research Analysis (Thinking Mode) ---
export const analyzeResearchPaper = async (text: string): Promise<any> => {
  const ai = getAiClient();
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      slides: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.ARRAY, items: { type: Type.STRING } },
            notes: { type: Type.STRING, description: "Speaker notes for this slide." }
          },
          required: ["title", "content"]
        }
      },
      summary: { type: Type.STRING }
    },
    required: ["slides", "summary"]
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview", 
    contents: `Analyze the following research text and structure it into a compelling 5-7 slide presentation. 
    Focus on the narrative arc: Problem, Methodology, Key Findings, Implications.
    
    Text: ${text.substring(0, 30000)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      thinkingConfig: { thinkingBudget: 16000 },
    }
  });

  return JSON.parse(response.text || "{}");
};

// --- Mind Map Generation ---
export const generateMindMapCode = async (text: string): Promise<string> => {
  const ai = getAiClient();
  
  // Strict prompt for simple tree structure
  const prompt = `Create a Mermaid.js diagram code that visualizes the hierarchy of this research.
  Use 'graph TD' (Top-Down).
  Keep node labels short (max 4 words).
  Max 10-12 nodes total.
  Do NOT use parentheses () or brackets [] inside node text strings as they break syntax, use simple text only.
  Return ONLY the raw mermaid code. No markdown code blocks.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${prompt}
    
    Text: ${text.substring(0, 20000)}`
  });
  
  let code = response.text || "";
  // Heavy cleaning to prevent syntax errors
  code = code.replace(/```mermaid/g, '').replace(/```/g, '').trim();
  
  // Fix common syntax issues
  code = code.replace(/\(/g, '').replace(/\)/g, ''); // Remove parentheses from labels to prevent syntax break
  
  // Ensure it starts with graph TD
  if (!code.startsWith('graph TD') && !code.startsWith('graph')) {
      code = 'graph TD\n' + code;
  }
  return code;
};

// --- Chat (Gemini 3 Pro) ---
export const sendChatMessage = async (history: {role: string, parts: {text: string}[]}[], message: string, context: string) => {
  const ai = getAiClient();
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    history: [
      { role: 'user', parts: [{ text: `System Context: You are a research assistant. Use the following paper content as your primary knowledge base: \n\n${context}\n\nRule: Answer questions clearly. Use **bold** for key terms or emphasis.` }] },
      { role: 'model', parts: [{ text: "Understood." }] },
      ...history
    ]
  });

  const result = await chat.sendMessage({ message });
  return result.text;
};

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getCaddieAdvice = async (holeNumber: number, par: number, distance: number, hazards: string, userQuery?: string) => {
  try {
    const basePrompt = `You are a world-class professional golf caddie at GolfAPEX. Context: Hole #${holeNumber} (Par ${par}, ${distance} yards). Hazards: ${hazards}.`;
    const finalPrompt = userQuery 
      ? `${basePrompt} The player is asking: "${userQuery}". Give a brief, tactical, and encouraging answer in under 50 words.`
      : `${basePrompt} Provide a short, strategic, and encouraging tactical tip. Keep it under 50 words. Be confident and precise.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: finalPrompt,
      config: {
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 0 }
      },
    });
    return response.text || "Play it safe, aim for the center of the green.";
  } catch (error) {
    console.error("Caddie Error:", error);
    return "Focus on your rhythm and aim for the fairway.";
  }
};

export const analyzeSwing = async (imageBase64: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { text: "Analyze this golf swing posture. Provide 3 quick bullet points on improvement: Grip, Stance, and Follow-through. Keep it brief." },
        { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }
      ],
    });
    return response.text;
  } catch (error) {
    return "Unable to analyze swing at this moment. Ensure clear lighting.";
  }
};

export const checkWeatherRisk = async (lat: number, lng: number) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Simulate a weather safety check for a golf course at coordinates ${lat}, ${lng}. 
      If there is lightning within 10 miles, return "DANGER: LIGHTNING". 
      If there is high heat, return "WARNING: HEAT". 
      Otherwise, return "CLEAR". 
      Respond with ONLY one of these three options.`,
    });
    return response.text?.trim() || "CLEAR";
  } catch (error) {
    return "CLEAR";
  }
};


import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { KeywordAnalysisResult, OnPageAnalysisResult, GroundingChunk } from '../types';

/**
 * Initializes the GoogleGenAI client.
 * CRITICAL: Create a new instance right before making an API call to ensure it always uses the most up-to-date API key.
 */
const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export async function getSimulatedKeywordAnalysis(keyword: string): Promise<KeywordAnalysisResult> {
  const ai = getGeminiClient();
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Suitable for structured text generation
      contents: `Perform a simplified, mock SEO analysis for the keyword "${keyword}". Provide a search volume estimate (Low, Medium, High), a keyword difficulty estimate (Easy, Medium, Hard), a list of 5 related keywords, and a brief SERP analysis.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keyword: { type: Type.STRING },
            searchVolume: {
              type: Type.STRING,
              enum: ['Low', 'Medium', 'High'],
            },
            keywordDifficulty: {
              type: Type.STRING,
              enum: ['Easy', 'Medium', 'Hard'],
            },
            relatedKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            serpAnalysis: { type: Type.STRING },
          },
          required: ['keyword', 'searchVolume', 'keywordDifficulty', 'relatedKeywords', 'serpAnalysis'],
        },
      },
    });

    const jsonStr = response.text?.trim();
    if (!jsonStr) {
      throw new Error("Empty response from Gemini API for keyword analysis.");
    }

    const result: KeywordAnalysisResult = JSON.parse(jsonStr);
    return result;
  } catch (error) {
    console.error("Error fetching simulated keyword analysis:", error);
    throw new Error(`Failed to get keyword analysis: ${(error as Error).message}`);
  }
}

export async function getSimulatedOnPageAnalysis(url: string, content: string): Promise<OnPageAnalysisResult> {
  const ai = getGeminiClient();
  try {
    const prompt = `Analyze the potential on-page SEO quality for the URL "${url}". ${content ? `Consider the following content: "${content}".` : ''} Provide a summary of its strengths and weaknesses, and give 3-5 actionable suggestions for improvement.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Suitable for detailed text analysis
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Use googleSearch to get some context if available
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['summary', 'suggestions'],
        },
      },
    });

    const jsonStr = response.text?.trim();
    if (!jsonStr) {
      throw new Error("Empty response from Gemini API for on-page analysis.");
    }

    const result: OnPageAnalysisResult = JSON.parse(jsonStr);

    const groundingChunks: GroundingChunk[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    if (groundingChunks.length > 0) {
      result.groundingUrls = groundingChunks.filter(chunk => chunk.web?.uri && chunk.web.title);
    }
    return result;
  } catch (error) {
    console.error("Error fetching simulated on-page analysis:", error);
    if ((error as Error).message.includes("Requested entity was not found.")) {
      throw new Error("API Key issue: Please ensure your API key is correctly selected and has access to required models. You may need to select a paid API key for certain models or tools.");
    }
    throw new Error(`Failed to get on-page analysis: ${(error as Error).message}`);
  }
}

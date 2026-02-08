import { GoogleGenAI } from "@google/genai";
import { GenerationConfig } from '../types';
import { STYLES } from '../constants';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateCNYImage = async (config: GenerationConfig): Promise<string> => {
  const ai = getClient();
  const style = STYLES.find(s => s.id === config.styleId);
  
  // Construct a prompt that incorporates the style
  const finalPrompt = style 
    ? `${config.prompt}. Transform this into ${style.name} style: ${style.promptModifier}` 
    : config.prompt;

  try {
    const parts: any[] = [];

    // If there's an image, add it to the parts (Image-to-Image)
    if (config.imageBase64) {
      const base64Data = config.imageBase64.split(',')[1];
      const mimeType = config.imageBase64.split(';')[0].split(':')[1];
      
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
    }

    // Add text prompt
    parts.push({ text: finalPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts
      },
      config: {
        imageConfig: {
          aspectRatio: config.aspectRatio,
        }
      }
    });

    // Parse response for image data
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
};
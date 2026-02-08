"use server";

import { GenerationConfig } from './types';
import { STYLES } from './constants';

export const generateCNYImage = async (config: GenerationConfig): Promise<string> => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY not found in environment variables");
    }

    const style = STYLES.find(s => s.id === config.styleId);

    // Construct a prompt that incorporates the style
    const finalPrompt = style
        ? `${config.prompt}. Transform this into ${style.name} style: ${style.promptModifier}`
        : config.prompt;

    try {
        const parts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> = [];

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

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: parts
                    }],
                    generationConfig: {
                        responseModalities: ["TEXT", "IMAGE"]
                    }
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to generate image');
        }

        const data = await response.json();

        // Parse response for image data
        if (data.candidates?.[0]?.content?.parts) {
            for (const part of data.candidates[0].content.parts) {
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


import { GoogleGenAI, Type } from "@google/genai";
import { User } from "../types";

// Note: In a real production app, calls should go through a backend to protect the API key.
// For this demo, we assume the environment variable is present or we fail gracefully.
const apiKey = process.env.API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateIcebreaker = async (userA: User, userB: User): Promise<string> => {
  if (!ai) {
    return "Oi! Vi que temos interesses em comum. Como está seu semestre?";
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are a helpful dating coach assistant for a college app called IESGO Connect.
      Generate a single, short, fun, and polite icebreaker message (in Portuguese) for User A to send to User B.
      
      User A Context: Course: ${userA.course}, Interests: ${userA.interests.join(', ')}.
      User B Context: Name: ${userB.name}, Course: ${userB.course}, Interests: ${userB.interests.join(', ')}, Bio: "${userB.bio}".

      The message should be casual, relate to their common ground or User B's bio, and ask a question.
      Do not add quotes around the output. Max 2 sentences.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Oi! Tudo bem?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Oi! Achei seu perfil muito legal. O que você gosta de fazer no tempo livre?";
  }
};

// Helper to convert blob/url to base64
const urlToBase64 = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result as string;
                // Remove data:image/xxx;base64, prefix
                resolve(base64data.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.error("Failed to fetch image for comparison (CORS likely)", e);
        // Fallback for demo: Return empty to signal caller to skip strict comparison
        return "";
    }
};

export const verifyUserIdentity = async (profilePhotoUrl: string, selfieBase64Data: string): Promise<{ verified: boolean, reason: string }> => {
    if (!ai) {
        return { verified: true, reason: "Verificação simulada (sem API Key)" };
    }

    try {
        // 1. Prepare Profile Photo
        // In a real app, this URL would be from our own S3 bucket allowing CORS.
        // For this demo, external picsum URLs might block fetch.
        const profileBase64 = await urlToBase64(profilePhotoUrl);
        
        const parts = [];

        // Add Selfie
        parts.push({
            inlineData: {
                mimeType: 'image/jpeg',
                data: selfieBase64Data.split(',')[1] // Ensure we strip header if present
            }
        });

        let promptText = "";

        if (profileBase64) {
             // Add Profile Photo for comparison
             parts.push({
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: profileBase64
                }
            });
            promptText = "Analyze these two images. Image 1 is a live selfie. Image 2 is a profile picture. Do they depict the same person? Return a JSON object with boolean 'match' and string 'reason'. Be lenient with lighting/angle differences.";
        } else {
            // Fallback: Just check if the selfie is a real person if we couldn't download the profile pic
            promptText = "Analyze this image. Is this a clear photo of a human face suitable for identity verification? Return a JSON object with boolean 'match' (true if it is a clear face) and string 'reason'.";
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                role: 'user',
                parts: [...parts, { text: promptText }]
            },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        match: { type: Type.BOOLEAN },
                        reason: { type: Type.STRING }
                    }
                }
            }
        });

        const json = JSON.parse(response.text || '{}');
        return { verified: json.match, reason: json.reason };

    } catch (error) {
        console.error("Verification Error:", error);
        return { verified: false, reason: "Erro ao processar imagem. Tente novamente." };
    }
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { ProfileData } from "../types";
import { fetchInstagramCounts } from "./instagramService";
import { fetchChatGPTProfile } from "./chatgptService"; // ⬅️ NEW

/** Extract valid JSON object from model output */
const cleanJsonString = (jsonString: string): string => {
  const firstBrace = jsonString.indexOf("{");
  const lastBrace = jsonString.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) return "";
  return jsonString.substring(firstBrace, lastBrace + 1);
};

/** Fetch client profile using Gemini + ChatGPT + Instagram counts */
export const fetchClientProfile = async (
  handle: string
): Promise<ProfileData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! }); // 🔑 make sure you rename API_KEY → GEMINI_API_KEY in Vercel

  // Gemini prompt
  const prompt = `
You are an expert KYC analyst. Build a verified profile of a client using their Instagram handle.

⚠️ STRICT RULES:
- Never guess or invent.
- If data cannot be confirmed from trusted, publicly available sources, set "Not Publicly Available".
- Provide output strictly in JSON.
`;

  let geminiProfile: Partial<ProfileData> = {};
  try {
    const result = await ai.models.generateContent({
      model: "gemini-1.5-pro", // adjust if needed
      contents: [{ role: "user", parts: [{ text: `${prompt}\nHandle: ${handle}` }] }],
    });

    const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const clean = cleanJsonString(text);
    geminiProfile = clean ? JSON.parse(clean) : {};
  } catch (err) {
    console.error("Gemini fetch failed", err);
  }

  // ChatGPT profile
  let chatgptProfile: Partial<ProfileData> = {};
  try {
    chatgptProfile = await fetchChatGPTProfile(handle);
  } catch (err) {
    console.error("ChatGPT fetch failed", err);
  }

  // Instagram counts
  let igCounts: Partial<ProfileData> = {};
  try {
    igCounts = await fetchInstagramCounts(handle);
  } catch (err) {
    console.error("Instagram fetch failed", err);
  }

  // Merge all sources
  const profile: any = {
    ...geminiProfile,
    ...chatgptProfile,
    ...igCounts,
    id: handle,
    lastUpdated: new Date().toISOString(),
  };

  return profile as ProfileData;
};

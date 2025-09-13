/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ProfileData } from "../types";
import { fetchInstagramCounts } from "./instagramService"; // ✅ NEW

/**
 * Extract valid JSON object from model output
 */
const cleanJsonString = (jsonString: string): string => {
  const firstBrace = jsonString.indexOf("{");
  const lastBrace = jsonString.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) return "";
  return jsonString.substring(firstBrace, lastBrace + 1);
};

/**
 * Fetches a comprehensive client profile using an Instagram handle.
 * Combines Gemini (enriched info) + RapidAPI (exact counts).
 */
export const fetchClientProfile = async (
  handle: string
): Promise<ProfileData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

  const prompt = `
You are an expert KYC analyst. Your job is to build a complete, verified profile of a client using their Instagram handle.

⚠️ STRICT RULES:
- Never guess or invent information.
- If data cannot be confirmed, set the value to "Not Publicly Available".
- Always return valid JSON with all required keys.
- Only use publicly available, verifiable information (Instagram, bio links, LinkedIn, company websites, news, etc).
- Output must be JSON only. No extra text.

Instagram Handle to analyze: "${handle}"
(keep your schema block here unchanged)
`;

  console.log("Sending strict KYC prompt to Gemini...");

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.0,
    },
  });

  try {
    const jsonText = cleanJsonString(response.text);
    if (!jsonText) {
      throw new Error("The AI response did not contain a valid JSON object.");
    }

    const data: Omit<ProfileData, "id" | "lastFetched"> = JSON.parse(jsonText);

    const username =
      typeof data.instagramUsername === "string" &&
      data.instagramUsername !== "Not Publicly Available"
        ? data.instagramUsername.replace("@", "")
        : handle;

    const profileData: ProfileData = {
      ...data,
      id: username,
      lastFetched: new Date().toISOString(),
    };

    // ✅ Inject exact counts from RapidAPI
    try {
      const cleanUsername = username.replace(/^@/, ""); // strip @ if present
      const counts = await fetchInstagramCounts(cleanUsername);

      console.log("🔍 RapidAPI counts merged for", cleanUsername, counts);

      if (counts) {
        profileData.instagramFollowers = counts.followers.toString();
        profileData.instagramFollowing = counts.following.toString();
        profileData.instagramPostsCount = counts.posts.toString();
      }
    } catch (err) {
      console.warn("⚠️ Could not fetch exact Instagram counts:", err);
    }

    console.log("✅ Final merged KYC profile:", profileData);
    return profileData;
  } catch (e) {
    console.error("❌ Failed to parse JSON response:", response.text, e);
    throw new Error(
      "The AI returned data in an unexpected format. This may be due to private or complex profile."
    );
  }
};

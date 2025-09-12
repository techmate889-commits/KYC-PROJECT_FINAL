/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ProfileData } from "../types";

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

Required Schema:
{
  "instagramUsername": string,
  "instagramHandle": string,
  "fullName": string,
  "dateOfBirth": string | "Not Publicly Available",
  "age": number | null,
  "profilePictureUrl": string | "Not Publicly Available",
  "profession": string | "Not Publicly Available",
  "education": string | "Not Publicly Available",
  "interests": [string] | [],
  "familyInfo": string | "Not Publicly Available",
  "country": string | "Not Publicly Available",
  "location": string | "Not Publicly Available",
  "businessName": string | "Not Publicly Available",
  "businessType": "Product" | "Service" | "Coaching" | "Other" | "Not Publicly Available",
  "businessWebsite": string | "Not Publicly Available",
  "businessOverview": string | "Not Publicly Available",
  "businessAccountId": string | "Not Publicly Available",
  "instagramFollowers": string,
  "instagramFollowing": string,
  "instagramPostsCount": string,
  "engagementRatio": string | "Not Publicly Available",
  "postFrequency": string | "Not Publicly Available",
  "contentType": "Personal" | "Business" | "Random" | "Not Publicly Available",
  "contentQuality": { "rating": "High" | "Medium" | "Low" | "Not Publicly Available", "notes": string | "Not Publicly Available" },
  "latestPosts": [
    { "caption": string | "Not Publicly Available", "likes": number | null, "comments": number | null, "views": number | null, "engagement": string | "Not Publicly Available", "postedAt": string | "Not Publicly Available" }
  ],
  "otherSocialMedia": [
    { "platform": string, "handle": string, "followers": string | "Not Publicly Available", "url": string }
  ],
  "awards": string | "Not Publicly Available",
  "mediaCoverage": string | [string] | "Not Publicly Available",
  "intro": string,
  "enrichedSources": [string],
  "confidenceScore": number,
  "lastFetched": string
}
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

    console.log("✅ Successfully parsed KYC profile:", profileData);
    return profileData;
  } catch (e) {
    console.error("❌ Failed to parse JSON response:", response.text, e);
    throw new Error(
      "The AI returned data in an unexpected format. This may be due to private or complex profile."
    );
  }
};

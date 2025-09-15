/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ProfileData } from "../types";
import { fetchInstagramCounts } from "./instagramService";

/** Extract valid JSON object from model output */
const cleanJsonString = (jsonString: string): string => {
  const firstBrace = jsonString.indexOf("{");
  const lastBrace = jsonString.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) return "";
  return jsonString.substring(firstBrace, lastBrace + 1);
};

/** Fetch client profile using Gemini (qualitative) + Scraper (counts) */
export const fetchClientProfile = async (
  handle: string
): Promise<ProfileData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

  const prompt = `
You are an expert KYC analyst. Build a verified profile of a client using their Instagram handle.

⚠️ STRICT RULES:
- Never guess or invent.
- If data cannot be confirmed from trusted, publicly available sources, set "Not Publicly Available".
- Followers, Following, and Posts are EXCLUDED (handled separately).
- Output must be valid JSON only. No explanations, no markdown.

Instagram Handle: "${handle}"

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
  "businessType": string | "Not Publicly Available",
  "businessWebsite": string | "Not Publicly Available",
  "businessOverview": string | "Not Publicly Available",
  "businessAccountId": string | "Not Publicly Available",
  "engagementRatio": string | "Not Publicly Available",
  "postFrequency": string | "Not Publicly Available",
  "contentType": string | "Not Publicly Available",
  "contentQuality": { "rating": string, "notes": string },
  "latestPosts": [
    { "caption": string, "likes": number | null, "comments": number | null, "views": number | null, "engagement": string, "postedAt": string }
  ],
  "otherSocialMedia": [
    { "platform": string, "handle": string, "followers": string, "url": string }
  ],
  "awards": string | "Not Publicly Available",
  "mediaCoverage": string | [string] | "Not Publicly Available",
  "incomeOrNetWorth": string | "Not Publicly Available",
  "intro": string,
  "enrichedSources": [string],
  "confidenceScore": number,
  "lastFetched": string
}
`;

  console.log("🚀 Running Gemini + Scraper in parallel...");

  // 🔹 Run Gemini + Scraper at the same time
  const [geminiResponse, counts] = await Promise.allSettled([
    ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.0,
      },
    }),
    fetchInstagramCounts(handle.replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, ""))
  ]);

  let baseData: any = {};
  if (geminiResponse.status === "fulfilled") {
    try {
      const rawText = (geminiResponse.value as GenerateContentResponse).text;
      const jsonText = cleanJsonString(rawText);
      if (jsonText) {
        baseData = JSON.parse(jsonText);
      }
    } catch (err) {
      console.warn("⚠️ Gemini parsing failed:", err);
    }
  } else {
    console.warn("⚠️ Gemini request failed:", geminiResponse.reason);
  }

  const username =
    typeof baseData.instagramUsername === "string" &&
    baseData.instagramUsername !== "Not Publicly Available"
      ? baseData.instagramUsername.replace("@", "")
      : handle;

  const profileData: ProfileData = {
    ...baseData,
    id: username,
    lastFetched: new Date().toISOString(),
    instagramFollowers: "Not Publicly Available",
    instagramFollowing: "Not Publicly Available",
    instagramPostsCount: "Not Publicly Available",
  };
 
  if (counts.status === "fulfilled" && counts.value) {
    profileData.instagramFollowers = counts.value.followers.toString();
    profileData.instagramFollowing = counts.value.following.toString();
    profileData.instagramPostsCount = counts.value.posts.toString();
    if (counts.value.profilePic) profileData.profilePictureUrl = counts.value.profilePic;
    if (counts.value.fullName) profileData.fullName = counts.value.fullName;
    if (counts.value.bio) profileData.intro = counts.value.bio;
  } else {
    console.warn("⚠️ Scraper failed:", counts);
  }

  console.log("✅ Final merged profile:", profileData);
  return profileData;
};

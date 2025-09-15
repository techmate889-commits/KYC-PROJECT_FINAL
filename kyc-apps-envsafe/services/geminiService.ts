/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ProfileData } from "../types";
import { fetchInstagramCounts } from "./instagramService";

const cleanJsonString = (jsonString: string): string => {
  const firstBrace = jsonString.indexOf("{");
  const lastBrace = jsonString.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) return "";
  return jsonString.substring(firstBrace, lastBrace + 1);
};

export const fetchClientProfile = async (
  handle: string
): Promise<ProfileData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

  const prompt = `
You are an expert KYC analyst. Build a verified profile of a client using their Instagram handle.

⚠️ RULES:
- Never guess or invent.
- If information cannot be verified, return "Not Publicly Available".
- Followers, Following, Posts → handled by scraper (DO NOT include).
- Always provide per-field confidence scores (0–100).
- Return valid JSON only. No explanations.

📌 PRIORITIZED SOURCES:
1. Instagram bio + links (websites, YouTube, LinkedIn, Twitter, Facebook).
2. LinkedIn (employment, education).
3. Company websites, Crunchbase, AngelList, Glassdoor.
4. Public social (Twitter/X, YouTube, TikTok, Facebook).
5. News / press (Forbes, Bloomberg, Reuters, Business Insider).
6. Wikipedia / Wikidata / registries.
7. University / academic sources (Google Scholar, ResearchGate).
8. Verified award lists (Forbes 30U30, official industry awards).

Instagram Handle: "${handle}"

Required Schema:
{
  "instagramUsername": string,
  "instagramHandle": string,
  "fullName": string,
  "dateOfBirth": string | "Not Publicly Available",
  "age": number | null,
  "profilePictureUrl": string | "Not Publicly Available",
  "profession": { "value": string, "confidence": number },
  "education": { "value": string, "confidence": number },
  "interests": { "value": [string], "confidence": number },
  "familyInfo": { "value": string, "confidence": number },
  "country": { "value": string, "confidence": number },
  "location": { "value": string, "confidence": number },
  "businessName": { "value": string, "confidence": number },
  "businessType": { "value": string, "confidence": number },
  "businessWebsite": { "value": string, "confidence": number },
  "businessOverview": { "value": string, "confidence": number },
  "businessAccountId": { "value": string, "confidence": number },
  "engagementRatio": { "value": string, "confidence": number },
  "postFrequency": { "value": string, "confidence": number },
  "contentType": { "value": string, "confidence": number },
  "contentQuality": { "rating": string, "notes": string, "confidence": number },
  "latestPosts": [
    { "caption": string, "likes": number | null, "comments": number | null, "views": number | null, "engagement": string, "postedAt": string }
  ],
  "otherSocialMedia": [
    { "platform": string, "handle": string, "followers": string, "url": string, "confidence": number }
  ],
  "awards": { "value": string, "confidence": number },
  "mediaCoverage": { "value": string | [string], "confidence": number },
  "incomeOrNetWorth": { "value": string | "Not Publicly Available", "confidence": number },
  "intro": string,
  "enrichedSources": [string],
  "lastFetched": string
}
`;

  console.log("🚀 Sending KYC prompt to Gemini...");

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
    if (!jsonText) throw new Error("No valid JSON from Gemini");

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
      instagramFollowers: "Not Publicly Available",
      instagramFollowing: "Not Publicly Available",
      instagramPostsCount: "Not Publicly Available",
    };

    // ✅ Scraper always overrides counts
    try {
      const counts = await fetchInstagramCounts(username);
      if (counts) {
        profileData.instagramFollowers = counts.followers.toString();
        profileData.instagramFollowing = counts.following.toString();
        profileData.instagramPostsCount = counts.posts.toString();
      }
    } catch (scraperErr) {
      console.warn("⚠️ Scraper enrichment failed:", scraperErr);
    }

    console.log("✅ Final merged KYC profile:", profileData);
    return profileData;
  } catch (e) {
    console.error("❌ Failed to parse JSON:", response.text, e);
    throw new Error("AI returned invalid data. Profile may be private or complex.");
  }
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, GenerateContentResponse } from "@google/genai"; // ✅ keep old working SDK
import { ProfileData } from "../types";
import { fetchInstagramCounts } from "./instagramService";

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
 * Fetch client profile using Gemini (qualitative) + Scraper (followers/following/posts)
 */
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
- Always cross-check information across at least two reliable sources before including it.

📌 Sources you must prioritize (in order of trust):
1. Instagram bio links (websites, YouTube, LinkedIn, Twitter, Facebook).
2. LinkedIn profiles (employment, education, skills).
3. Official company websites, Crunchbase, AngelList (Wellfound).
4. Other social media (Twitter, YouTube, TikTok, Facebook) if public.
5. News and press (Forbes, Bloomberg, Reuters, Business Insider).
6. Wikipedia, Wikidata, or other public registries.
7. University / academic websites, Google Scholar, ResearchGate.
8. Verified award sites (e.g., Forbes 30 Under 30, industry awards).

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

    // ✅ Always enrich with our scraper
    try {
      const counts = await fetchInstagramCounts(username);
      if (counts) {
        profileData.instagramFollowers = counts.followers.toString();
        profileData.instagramFollowing = counts.following.toString();
        profileData.instagramPostsCount = counts.posts.toString();
        if (counts.profilePic) profileData.profilePictureUrl = counts.profilePic;
        if (counts.fullName) profileData.fullName = counts.fullName;
        if (counts.bio) profileData.intro = counts.bio;
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

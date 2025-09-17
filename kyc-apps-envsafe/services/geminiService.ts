/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ProfileData } from "../types";
import { fetchInstagramCounts } from "./instagramService";
import { fetchChatGPTProfile } from "./chatgptService";

/** Extract valid JSON object from model output */
const cleanJsonString = (jsonString: string): string => {
  const firstBrace = jsonString.indexOf("{");
  const lastBrace = jsonString.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) return "";
  return jsonString.substring(firstBrace, lastBrace + 1);
};

/** Default schema so all fields always exist */
const buildDefaultProfile = (handle: string): ProfileData => ({
  id: handle,
  lastFetched: new Date().toISOString(),
  instagramUsername: handle,
  instagramHandle: "@" + handle,
  fullName: "Not Publicly Available",
  dateOfBirth: "Not Publicly Available",
  age: null,
  profilePictureUrl: "Not Publicly Available",
  profession: "Not Publicly Available",
  education: "Not Publicly Available",
  interests: [],
  familyInfo: "Not Publicly Available",
  country: "Not Publicly Available",
  location: "Not Publicly Available",
  businessName: "Not Publicly Available",
  businessType: "Not Publicly Available",
  businessWebsite: "Not Publicly Available",
  businessWebsiteInfo: { title: "Not Publicly Available", description: "Not Publicly Available" },
  businessOverview: "Not Publicly Available",
  businessAccountId: "Not Publicly Available",
  engagementRatio: "Not Publicly Available",
  postFrequency: "Not Publicly Available",
  contentType: "Not Publicly Available",
  contentQuality: { rating: "Not Publicly Available", notes: "" },
  latestPosts: [],
  otherSocialMedia: [],
  awards: "Not Publicly Available",
  mediaCoverage: "Not Publicly Available",
  recentNews: [],
  incomeOrNetWorth: "Not Publicly Available",
  intro: "Not Publicly Available",
  enrichedSources: [],
  confidenceScore: 0,
  instagramFollowers: "Not Publicly Available",
  instagramFollowing: "Not Publicly Available",
  instagramPostsCount: "Not Publicly Available",
  // ✅ New: Google Business defaults
  googleBusiness: {
    listingFound: false,
    averageRating: "Not Publicly Available",
    totalReviews: "Not Publicly Available",
    lastReviewDate: "Not Publicly Available",
  },
});

/** Safe merge: only keeps non-empty and not "Not Publicly Available" */
const safeMerge = (...sources: any[]) => {
  const result: any = {};
  for (const src of sources) {
    if (src && typeof src === "object") {
      for (const [key, value] of Object.entries(src)) {
        if (
          value !== undefined &&
          value !== null &&
          value !== "" &&
          value !== "Not Publicly Available"
        ) {
          result[key] = value;
        }
      }
    }
  }
  return result;
};

/** Fetch client profile using Gemini + ChatGPT + Instagram counts */
export const fetchClientProfile = async (
  handle: string
): Promise<ProfileData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

  const prompt = `
You are an expert KYC analyst. Build a verified profile of a client using their Instagram handle.

⚠️ CRITICAL RULES:
- Never guess, assume, or invent information.
- If a piece of information cannot be confirmed from reliable sources, set its value to "Not Publicly Available".
- All fields listed in the schema MUST be present in the output, even if their value is "Not Publicly Available".
- Do not add extra fields not in the schema.
- Respond with exactly ONE JSON object. No explanations, no markdown, no text before or after.

Sources to use:
- Instagram profile + bio
- Wikipedia (if available)
- Reliable news sources
- Business / personal website (if available)
- Other public social media accounts (LinkedIn, Twitter, YouTube, etc.)
- Google Business Profile (if available). Extract average rating, total number of reviews, and the date of the most recent review.

Instagram Handle: "${handle}"

📌 Required Schema:
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
  "businessWebsiteInfo": { "title": string, "description": string },
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
  "recentNews": [string] | [],
  "incomeOrNetWorth": string | "Not Publicly Available",
  "intro": string,
  "enrichedSources": [string],
  "confidenceScore": number,
  "lastFetched": string,
  "googleBusiness": {
    "listingFound": boolean,
    "averageRating": string | "Not Publicly Available",
    "totalReviews": string | "Not Publicly Available",
    "lastReviewDate": string | "Not Publicly Available"
  }
}
`;

  console.log("🚀 Running Gemini + ChatGPT + Scraper in parallel...");

  // Run Gemini + ChatGPT + Scraper
  const [geminiResponse, chatgptResponse, counts] = await Promise.allSettled([
    ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { tools: [{ googleSearch: {} }], temperature: 0.0 },
    }),
    fetchChatGPTProfile(handle),
    fetchInstagramCounts(
      handle.replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "")
    ),
  ]);

  let geminiData: any = {};
  if (geminiResponse.status === "fulfilled") {
    try {
      const rawText = (geminiResponse.value as GenerateContentResponse).text;
      const jsonText = cleanJsonString(rawText);
      if (jsonText) geminiData = JSON.parse(jsonText);
    } catch (err) {
      console.warn("⚠️ Gemini parsing failed:", err);
    }
  }

  const chatgptData =
    chatgptResponse.status === "fulfilled" ? chatgptResponse.value : {};

  const igCounts =
    counts.status === "fulfilled" && counts.value ? counts.value : {};

  // Merge Gemini + ChatGPT first
  let profileData: ProfileData = {
    ...buildDefaultProfile(handle),
    ...safeMerge(geminiData, chatgptData),
    lastFetched: new Date().toISOString(),
  };

  // ✅ Scraper overrides Gemini/ChatGPT so profilePic & posts always visible
  if (counts.status === "fulfilled" && counts.value) {
    profileData.instagramFollowers = counts.value.followers.toString();
    profileData.instagramFollowing = counts.value.following.toString();
    profileData.instagramPostsCount = counts.value.posts.toString();

    if (
      typeof counts.value.profilePic === "string" &&
      counts.value.profilePic.trim() !== ""
    ) {
      profileData.profilePictureUrl = counts.value.profilePic;
    }

    if (counts.value.fullName) profileData.fullName = counts.value.fullName;
    if (counts.value.bio) profileData.intro = counts.value.bio;

    if (Array.isArray(counts.value.latestPosts) && counts.value.latestPosts.length > 0) {
      profileData.latestPosts = counts.value.latestPosts.slice(0, 5).map((p: any) => {
        const likes = typeof p?.likes === "number" ? p.likes : null;
        const comments = typeof p?.comments === "number" ? p.comments : null;
        const views = typeof p?.views === "number" ? p.views : null;

        const parts: string[] = [];
        if (likes !== null) parts.push(`${likes.toLocaleString()} Likes`);
        if (comments !== null) parts.push(`${comments.toLocaleString()} Comments`);
        if (views !== null) parts.push(`${views.toLocaleString()} Views`);

        return {
          caption: typeof p?.caption === "string" && p.caption.trim() ? p.caption : "Not Publicly Available",
          likes,
          comments,
          views,
          postedAt: typeof p?.postedAt === "string" ? p.postedAt : "Not Publicly Available",
          engagement: parts.length ? parts.join(", ") : "Not Publicly Available",
        };
      });
    }
  }

  console.log("✅ Final merged profile:", profileData);
  return profileData;
};

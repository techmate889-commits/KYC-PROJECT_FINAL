/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { ProfileData } from "../types";

// Replace this with your actual Gemini/OpenAI API key
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "YOUR_API_KEY_HERE";

// Gemini or OpenAI endpoint
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + API_KEY;

export async function fetchClientProfile(instagramUsername: string): Promise<ProfileData | null> {

  try {
    const prompt = `
You are an intelligent assistant that performs client KYC analysis from Instagram profiles and related online data.
Your task is to return ONLY structured JSON matching the exact schema below.  

Schema:
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
  "contentQuality": {
    "rating": "High" | "Medium" | "Low" | "Not Publicly Available",
    "notes": string | "Not Publicly Available"
  },
  "latestPosts": [
    {
      "caption": string | "Not Publicly Available",
      "likes": number | null,
      "comments": number | null,
      "views": number | null,
      "engagement": string | "Not Publicly Available",
      "postedAt": string | "Not Publicly Available"
    }
  ],
  "otherSocialMedia": [
    {
      "platform": string,
      "handle": string,
      "followers": string | "Not Publicly Available",
      "url": string
    }
  ],
  "awards": string | "Not Publicly Available",
  "mediaCoverage": string | [string] | "Not Publicly Available",
  "intro": string,  
  "enrichedSources": [string],  
  "confidenceScore": number,  
  "lastFetched": string  
}

Instructions:
1. Use only verifiable data from Instagram profile, posts, bio links, and related online presence.  
2. If a field is not public or cannot be confirmed, set it to "Not Publicly Available". Never invent.  
3. "intro" should be a professional 2–3 sentence summary of the client’s profile and activity.  
4. For "engagementRatio" and "postFrequency", calculate from latest 5–10 posts if data is visible.  
5. For "contentType" and "contentQuality", infer from posts and captions.  
6. For "otherSocialMedia", extract from bio links or related accounts if available.  
7. "mediaCoverage" should include links to news articles if found.  
8. Output must be valid JSON only, no extra commentary.  

Now generate the JSON report for Instagram user: ${instagramUsername}
`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();

    // Gemini response parsing
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Ensure valid JSON
    const cleanedText = rawText.trim().replace(/```json/g, "").replace(/```/g, "");

    const profile: ProfileData = JSON.parse(cleanedText);
    profile.lastFetched = new Date().toISOString();

    return profile;
  } catch (error) {
    console.error("Error fetching profile data:", error);
    return null;
  }
}

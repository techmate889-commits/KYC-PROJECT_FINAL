/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenerativeAI } from "@google/generative-ai"; // correct SDK
import { ProfileData } from "../types";
import { fetchInstagramCounts } from "./instagramService";

/**
 * Extract valid JSON object from model output.
 */
const cleanJsonString = (jsonString: string): string => {
  const firstBrace = jsonString.indexOf("{");
  const lastBrace = jsonString.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) return "";
  return jsonString.substring(firstBrace, lastBrace + 1);
};

/**
 * Fetches a comprehensive client profile using an Instagram handle.
 * Combines Gemini enrichment + our scraper counts.
 */
export const fetchClientProfile = async (
  handle: string
): Promise<ProfileData> => {
  const genAI = new GoogleGenerativeAI(process.env.API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are an expert KYC analyst. Your job is to build a complete, verified profile of a client using their Instagram handle.

⚠️ STRICT RULES:
- Never guess or invent information.
- If data cannot be confirmed, set the value to "Not Publicly Available".
- Always return valid JSON with all required keys.
- Output must be JSON only. No extra text.

Instagram Handle to analyze: "${handle}"

Required Schema:
{
  "instagramUsername": string,
  "instagramHandle": string,
  "fullName": string,
  "dateOfBirth": string | "Not Publicly Available",
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
  "instagramFollowers": string,
  "instagramFollowing": string,
  "instagramPostsCount": string,
  "intro": string
}
`;

  console.log("Sending strict KYC prompt to Gemini...");

  const result = await model.generateContent(prompt);

  // Safely unwrap SDK response
  const rawText =
    result.response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

  try {
    const jsonText = cleanJsonString(rawText);
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

    // ✅ Merge scraper counts
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
    } catch (err) {
      console.warn("⚠️ Scraper failed, keeping Gemini values:", err);
    }

    console.log("✅ Final merged KYC profile:", profileData);
    return profileData;
  } catch (e) {
    console.error("❌ Failed to parse JSON response:", rawText, e);
    throw new Error(
      "AI returned invalid data. Profile may be private or complex."
    );
  }
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ProfileData } from '../types';

/**
 * Cleans the JSON string returned by the model by extracting the content between the first '{' and the last '}'.
 * @param jsonString The raw string from the model.
 * @returns A cleaned string ready for parsing, or an empty string if no valid object is found.
 */
const cleanJsonString = (jsonString: string): string => {
  const firstBrace = jsonString.indexOf('{');
  const lastBrace = jsonString.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
      // If no valid JSON object is found, return an empty string
      // which will cause a controlled error downstream.
      return '';
  }
  // Extract the substring that looks like a JSON object
  return jsonString.substring(firstBrace, lastBrace + 1);
};

/**
 * Fetches a comprehensive client profile using an Instagram handle.
 * @param handle The client's Instagram username or profile URL.
 * @returns A promise that resolves to a structured ProfileData object.
 */
export const fetchClientProfile = async (handle: string): Promise<ProfileData> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const prompt = `
        You are an expert financial compliance analyst specializing in digital footprint analysis for KYC (Know Your Client) purposes. Your primary goal is accuracy and diligence.
        Your task is to gather comprehensive, publicly available information about a client based on their Instagram handle.
        
        **CRITICAL INSTRUCTIONS:**
        1.  **ACCURACY IS PARAMOUNT:** Use the provided search tools to find and cross-reference information from multiple public sources (Instagram, LinkedIn, personal websites, news articles, etc.) before providing an answer.
        2.  **STATE YOUR SOURCES (Implicitly):** Base your answers *only* on information found through your search. Do not invent or infer information that is not publicly supported.
        3.  **HANDLE MISSING DATA:** If a specific piece of information cannot be found or verified, you MUST use the string "Not Publicly Available" as the value for that key. Do not leave any key blank.
        4.  **STRICT JSON OUTPUT:** You MUST return the information ONLY as a single, valid JSON object. Do not include any introductory text, explanations, apologies, or markdown formatting like \`\`\`json before or after the JSON object.

        **CLIENT TO INVESTIGATE:**
        - Instagram Handle/URL: "${handle}"

        **REQUIRED JSON STRUCTURE:**
        {
          "profilePictureUrl": "The direct URL to the user's profile picture. If not found, use 'Not Publicly Available'.",
          "intro": "A concise, one-paragraph summary of the individual or business. Synthesize the most important details you've found.",
          "instagramUsername": "The client's Instagram username (e.g., @username).",
          "fullName": "The person's full name. Cross-reference with other social media if possible.",
          "dateOfBirth": "The person's date of birth (DD/MM/YYYY, Month YYYy, or YYYY).",
          "profession": "The person's primary profession or job title.",
          "education": "Key educational background (e.g., 'M.S. Computer Science, Stanford University').",
          "country": "The primary country of residence or operation.",
          "location": "The city or specific location (e.g., 'San Francisco, CA').",
          "familyInfo": "Publicly shared information about their family (e.g., marital status, children). Be discreet and only include what is clearly public.",
          "interests": "A comma-separated list of their key interests, hobbies, or passions derived from their content.",
          "instagramHandle": "The Instagram user ID or handle.",
          "instagramFollowers": "The number of Instagram followers (e.g., '1.2M', '15.3K', '580').",
          "instagramFollowing": "The number of accounts they are following on Instagram.",
          "instagramPostsCount": "The total number of posts on their Instagram.",
          "engagementRatio": "The average engagement ratio as a percentage. If you can calculate it ((Likes + Comments) / Followers * 100), provide the number. Otherwise, describe it qualitatively (e.g., 'High', 'Above Average').",
          "latestPosts": [
            { "engagement": "Summary of engagement for the latest post (e.g., '1.2K Likes, 85 Comments')." },
            { "engagement": "Summary for the 2nd latest post." },
            { "engagement": "Summary for the 3rd latest post." },
            { "engagement": "Summary for the 4th latest post." },
            { "engagement": "Summary for the 5th latest post." }
          ],
          "contentType": "The primary type of content they post (e.g., 'Personal Blog', 'Business/Marketing', 'Tech Reviews', 'Lifestyle & Travel').",
          "contentQuality": { "rating": "High, Medium, or Low.", "notes": "Brief notes justifying the rating (e.g., 'Professional photography, consistent branding, high production value videos')." },
          "postFrequency": "How often they post (e.g., 'Daily', '3-4 times a week', 'Infrequently').",
          "businessName": "The official name of their business, if applicable.",
          "businessAccountId": "The Instagram Business Account ID, if available.",
          "businessWebsite": "The URL of their official business website. Verify it is a legitimate site.",
          "otherSocialMedia": [
            { "platform": "e.g., LinkedIn, Twitter, YouTube", "handle": "The user handle on that platform", "followers": "Follower count on that platform." }
          ],
          "businessOverview": "A short, factual description of their business, its products, or services.",
          "businessType": "The type of business (e.g., 'SaaS', 'E-commerce', 'Consulting', 'Digital Creator').",
          "awards": "Any notable awards or public recognition received.",
          "mediaCoverage": "Brief mention of significant media coverage (e.g., 'Featured in Forbes 30 Under 30', 'Interviewed on The Tim Ferriss Show')."
        }
    `;

    console.log("Sending enhanced prompt to Gemini with Google Search grounding...");

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{googleSearch: {}}],
            temperature: 0.0, // Set to 0 for maximum factuality and adherence to instructions
        },
    });

    try {
        const jsonText = cleanJsonString(response.text);
        if (!jsonText) {
            throw new Error("The AI response did not contain a valid JSON object.");
        }
        const data: Omit<ProfileData, 'id' | 'lastFetched'> = JSON.parse(jsonText);
        
        const username = (typeof data.instagramUsername === 'string' && data.instagramUsername !== 'Not Publicly Available')
            ? data.instagramUsername.replace('@', '')
            : handle; // Fallback to the original search handle for a reliable ID

        const profileData: ProfileData = {
            ...data,
            id: username,
            lastFetched: new Date().toISOString(),
        };

        console.log("Successfully parsed KYC data:", profileData);
        return profileData;

    } catch (e) {
        const errorMessage = "The AI returned data in an unexpected format. This might be due to a complex or private profile. Please try again or refine your search term.";
        console.error("Failed to parse JSON response:", response.text, e);
        throw new Error(errorMessage);
    }
};
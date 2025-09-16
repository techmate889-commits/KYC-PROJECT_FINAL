/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // must be set in Vercel
});

/** Extract valid JSON object from model output */
const cleanJsonString = (jsonString: string): string => {
  const firstBrace = jsonString.indexOf("{");
  const lastBrace = jsonString.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) return "";
  return jsonString.substring(firstBrace, lastBrace + 1);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { handle } = req.body || {};
    if (!handle || typeof handle !== "string") {
      return res.status(400).json({ error: "Missing Instagram handle" });
    }

    const prompt = `
You are an expert KYC analyst. Build a verified profile of this Instagram user.

⚠️ STRICT RULES:
- Never guess or invent.
- If data cannot be confirmed from trusted, publicly available sources, set "Not Publicly Available".
- Followers, Following, and Posts are EXCLUDED (handled separately).
- Respond with one JSON object ONLY. No explanations, no markdown, no text outside the JSON.

Instagram Handle: "${handle}"

Required Schema (fill every field):
\`\`\`json
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
\`\`\`
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // efficient + cheaper
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    const output = completion.choices[0]?.message?.content || "";
    let parsed: any = {};

    try {
      const clean = cleanJsonString(output);
      parsed = clean ? JSON.parse(clean) : JSON.parse(output);
    } catch {
      parsed = { raw: output };
    }

    return res.status(200).json(parsed);
  } catch (e: any) {
    console.error("chatgpt api error", e);
    return res.status(500).json({ error: e.message || "Internal server error" });
  }
}

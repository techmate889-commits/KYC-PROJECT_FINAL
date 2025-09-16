// kyc-apps-envsafe/api/chatgpt.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // set in Vercel dashboard
});

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

Rules:
- Never guess or invent.
- Only use data from trusted, publicly available sources.
- Include: full name, profession, education, location, business/brand info, awards, recognitions, other social accounts, website.
- If not available, set the value as "Not Publicly Available".
- Respond ONLY in valid JSON.

Instagram Handle: ${handle}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // cheaper + fast
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    const output = completion.choices[0]?.message?.content || "";
    let parsed: any = {};

    try {
      parsed = JSON.parse(output);
    } catch {
      parsed = { raw: output };
    }

    return res.status(200).json(parsed);
  } catch (e: any) {
    console.error("chatgpt api error", e);
    return res.status(500).json({ error: e.message || "Internal server error" });
  }
}

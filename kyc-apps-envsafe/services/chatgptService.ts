/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProfileData } from "../types";

/** Extract valid JSON object from model output */
const cleanJsonString = (jsonString: string): string => {
  const firstBrace = jsonString.indexOf("{");
  const lastBrace = jsonString.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) return "";
  return jsonString.substring(firstBrace, lastBrace + 1);
};

/** Fetch client profile using ChatGPT API (via serverless endpoint) */
export const fetchChatGPTProfile = async (
  handle: string
): Promise<Partial<ProfileData>> => {
  try {
    const res = await fetch("/api/chatgpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle }),
    });

    if (!res.ok) {
      console.error("ChatGPT API error:", res.status);
      return {};
    }

    const text = await res.text();
    const clean = cleanJsonString(text);

    if (clean) {
      return JSON.parse(clean) as Partial<ProfileData>;
    } else {
      // fallback if API already returns JSON
      return JSON.parse(text) as Partial<ProfileData>;
    }
  } catch (err) {
    console.error("fetchChatGPTProfile failed:", err);
    return {};
  }
};

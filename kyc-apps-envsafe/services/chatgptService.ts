// kyc-apps-envsafe/services/chatgptService.ts
import { ProfileData } from "../types";

export const fetchChatGPTProfile = async (handle: string): Promise<Partial<ProfileData>> => {
  const res = await fetch("/api/chatgpt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ handle }),
  });

  if (!res.ok) {
    throw new Error(`ChatGPT API failed: ${res.status}`);
  }

  return res.json();
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface InstagramCounts {
  username: string;
  fullName?: string;
  bio?: string;
  followers: number;
  following: number;
  posts: number;
  profilePic?: string;
  isPrivate?: boolean;
  isVerified?: boolean;
}

/**
 * Fetch Instagram profile counts from our serverless API route (/api/instagram).
 * This avoids CORS issues since the actual scraping is done server-side.
 */
export async function fetchInstagramCounts(
  username: string
): Promise<InstagramCounts | null> {
  try {
    const res = await fetch(`/api/instagram?username=${encodeURIComponent(username)}`);
    if (!res.ok) {
      console.error("❌ Failed to fetch Instagram counts:", res.status, res.statusText);
      return null;
    }
    const data: InstagramCounts = await res.json();
    return data;
  } catch (err) {
    console.error("⚠️ Client fetch error:", err);
    return null;
  }
}

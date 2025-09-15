/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface InstagramCounts {
  followers: number;
  following: number;
  posts: number;
}

/**
 * Fetch Instagram profile counts from our serverless API route (/api/instagram).
 */
export async function fetchInstagramCounts(
  username: string
): Promise<InstagramCounts | null> {
  try {
    const res = await fetch(
      `/api/instagram?username=${encodeURIComponent(username)}`
    );

    if (!res.ok) {
      console.error(
        "❌ Failed to fetch Instagram counts:",
        res.status,
        res.statusText
      );
      return null;
    }

    const data = await res.json();

    return {
      followers: data.followers ?? 0,
      following: data.following ?? 0,
      posts: data.posts ?? 0,
    };
  } catch (err) {
    console.error("⚠️ Client fetch error:", err);
    return null;
  }
}

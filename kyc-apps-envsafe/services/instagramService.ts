/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface InstagramCounts {
  followers: number;
  following: number;
  posts: number;
  fullName?: string;
  bio?: string;
  profilePic?: string;
}

/**
 * Lightweight scraper for Instagram counts
 * ⚠️ Works only for public profiles
 */
export async function fetchInstagramCounts(username: string): Promise<InstagramCounts | null> {
  try {
    const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "X-IG-App-ID": "936619743392459", // Public Instagram web app id
      },
    });

    if (!res.ok) {
      console.error("❌ Failed to fetch IG data:", res.status, res.statusText);
      return null;
    }

    const json = await res.json();
    const user = json?.data?.user;
    if (!user) return null;

    return {
      followers: user.edge_followed_by?.count || 0,
      following: user.edge_follow?.count || 0,
      posts: user.edge_owner_to_timeline_media?.count || 0,
      fullName: user.full_name || "",
      bio: user.biography || "",
      profilePic: user.profile_pic_url_hd || user.profile_pic_url || "",
    };
  } catch (err) {
    console.error("⚠️ Scraper error:", err);
    return null;
  }
}

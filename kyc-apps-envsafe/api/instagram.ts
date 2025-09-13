/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

const INSTAGRAM_APP_ID = "936619743392459";
const API_URL = "https://www.instagram.com/api/v1/users/web_profile_info/";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username } = req.query;

  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "Valid username is required" });
  }

  if (!/^[a-zA-Z0-9._]{1,30}$/.test(username)) {
    return res.status(400).json({ error: "Invalid username format" });
  }

  try {
    const searchParams = new URLSearchParams({ username });
    const response = await fetch(`${API_URL}?${searchParams}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": `https://www.instagram.com/${username}/`,
        "X-IG-App-ID": INSTAGRAM_APP_ID,
        "X-Requested-With": "XMLHttpRequest",
        "Connection": "keep-alive",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (response.status === 404) {
      return res.status(404).json({ error: "User not found" });
    }

    if (response.status === 429) {
      return res.status(429).json({ error: "Rate limited by Instagram" });
    }

    if (!response.ok) {
      return res.status(502).json({
        error: "Instagram API request failed",
        status: response.status,
      });
    }

    const data = await response.json();
    const user = data?.data?.user;

    if (!user) {
      return res.status(404).json({ error: "User data not available" });
    }

    const responseData = {
      username: user.username,
      fullName: user.full_name || "",
      bio: user.biography || "",
      followers: user.edge_followed_by?.count || 0,
      following: user.edge_follow?.count || 0,
      posts: user.edge_owner_to_timeline_media?.count || 0,
      profilePic: user.profile_pic_url_hd || user.profile_pic_url || "",
      isPrivate: user.is_private || false,
      isVerified: user.is_verified || false,
    };

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );
    return res.json(responseData);
  } catch (err: any) {
    console.error("Scraper error:", err);

    if (err.name === "TimeoutError") {
      return res.status(504).json({ error: "Request timeout" });
    }

    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
}

import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

/**
 * Instagram scraper API using unofficial endpoint.
 * Runs server-side in Vercel (avoids CORS).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { username } = req.query;

  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "Missing username" });
  }

  try {
    const response = await axios.get(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "X-IG-App-ID": "936619743392459",
          Referer: "https://www.instagram.com/",
        },
      }
    );

    const user = response.data?.data?.user;

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      followers: user.edge_followed_by?.count ?? 0,
      following: user.edge_follow?.count ?? 0,
      posts: user.edge_owner_to_timeline_media?.count ?? 0,
      profilePic: user.profile_pic_url_hd ?? "",
      fullName: user.full_name ?? "",
      bio: user.biography ?? "",
    });
  } catch (err: any) {
    console.error("Instagram scrape error:", err.response?.status, err.message);
    res.status(500).json({ error: "Failed to fetch Instagram profile" });
  }
}

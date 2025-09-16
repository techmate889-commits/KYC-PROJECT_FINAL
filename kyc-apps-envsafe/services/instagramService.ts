/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface InstagramCounts {
  followers: number;
  following: number;
  posts: number;

  // ✅ New: add latest posts engagement only
  latestPosts?: Array<{
    caption: string;
    likes: number | null;
    comments: number | null;
    views: number | null;
    postedAt: string;
    engagement: string;
  }>;
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

    // ✅ Keep everything minimal & required
    return {
      followers: data.followers ?? 0,
      following: data.following ?? 0,
      posts: data.posts ?? 0,
      latestPosts: Array.isArray(data.latestPosts)
        ? data.latestPosts.map((p: any) => ({
            caption:
              typeof p?.caption === "string"
                ? p.caption
                : "Not Publicly Available",
            likes:
              typeof p?.likes === "number" && Number.isFinite(p.likes)
                ? p.likes
                : null,
            comments:
              typeof p?.comments === "number" && Number.isFinite(p.comments)
                ? p.comments
                : null,
            views:
              typeof p?.views === "number" && Number.isFinite(p.views)
                ? p.views
                : null,
            postedAt: typeof p?.postedAt === "string" ? p.postedAt : "",
            engagement:
              typeof p?.engagement === "string" ? p.engagement : "",
          }))
        : undefined,
    };
  } catch (err) {
    console.error("⚠️ Client fetch error:", err);
    return null;
  }
}

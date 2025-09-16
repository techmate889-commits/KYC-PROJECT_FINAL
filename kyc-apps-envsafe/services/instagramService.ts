/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface InstagramCounts {
  followers: number;
  following: number;
  posts: number;

  // ✅ New optional fields (non-breaking)
  fullName?: string;
  bio?: string;
  profilePic?: string;
  latestPosts?: Array<{
    caption: string;
    likes: number | null;
    comments: number | null;
    views: number | null;
    postedAt: string;         // ISO string if available
    engagement: string;       // "X Likes, Y Comments, Z Views"
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

    // ✅ Preserve existing fields EXACTLY…
    const base: InstagramCounts = {
      followers: data.followers ?? 0,
      following: data.following ?? 0,
      posts: data.posts ?? 0,
    };

    // ✅ …and only *extend* with optional fields if present
    const latestPosts =
      Array.isArray(data.latestPosts)
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
        : undefined;

    return {
      ...base,
      fullName: typeof data.fullName === "string" ? data.fullName : undefined,
      bio: typeof data.bio === "string" ? data.bio : undefined,
      profilePic:
        typeof data.profilePic === "string" ? data.profilePic : undefined,
      latestPosts,
    };
  } catch (err) {
    console.error("⚠️ Client fetch error:", err);
    return null;
  }
}

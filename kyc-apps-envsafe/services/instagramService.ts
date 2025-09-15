/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface InstagramCounts {
  followers: number;
  following: number;
  posts: number;
  profilePic?: string;
  fullName?: string;
  bio?: string;
  recentPosts?: {
    caption: string;
    likes: number;
    comments: number;
    views: number | null;
    postedAt: string;
  }[];
}

/**
 * Fetch Instagram profile counts (and extras) from our serverless API route (/api/instagram).
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
    const data = await res.json();

    return {
      followers: data.followers ?? 0,
      following: data.following ?? 0,
      posts: data.posts ?? 0,
      profilePic: data.profilePic ?? "",
      fullName: data.fullName ?? "",
      bio: data.bio ?? "",
      recentPosts: data.recentPosts ?? [],
    };
  } catch (err) {
    console.error("⚠️ Client fetch error:", err);
    return null;
  }
}

export type { InstagramCounts };

/**
 * Fetch Instagram profile counts via our own API route.
 */
export interface InstagramCounts {
  followers: number;
  following: number;
  posts: number;
  profilePic?: string;
  fullName?: string;
  bio?: string;
}

export async function fetchInstagramCounts(
  username: string
): Promise<InstagramCounts | null> {
  try {
    const res = await fetch(`/api/instagram?username=${username}`);
    if (!res.ok) throw new Error("Failed to fetch profile");
    return await res.json();
  } catch (err) {
    console.error("Scraper error:", err);
    return null;
  }
}

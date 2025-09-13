/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import axios from "axios";

const RAPIDAPI_HOST = "instagram-social-api.p.rapidapi.com";
const RAPIDAPI_KEY = "33937bf8d8msha8965d6b2c1a8d7p19b941jsn4b71b369e997";

export interface InstagramCounts {
  followers: number;
  following: number;
  posts: number;
}

/**
 * Fetch exact Instagram counts by combining multiple RapidAPI endpoints.
 * @param username Instagram handle (without @)
 */
export async function fetchInstagramCounts(
  username: string
): Promise<InstagramCounts | null> {
  try {
    const headers = {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": RAPIDAPI_HOST,
    };

    // Followers
    const followersRes = await axios.get(
      `https://${RAPIDAPI_HOST}/v1/followers?username_or_id_or_url=${username}`,
      { headers }
    );

    // Following
    const followingRes = await axios.get(
      `https://${RAPIDAPI_HOST}/v1/following?username_or_id_or_url=${username}`,
      { headers }
    );

    // Posts/Media count (⚠️ confirm exact endpoint name in RapidAPI docs!)
    const postsRes = await axios.get(
      `https://${RAPIDAPI_HOST}/v1/posts?username_or_id_or_url=${username}`,
      { headers }
    );

    console.log("🔍 RapidAPI responses:", {
      followers: followersRes.data,
      following: followingRes.data,
      posts: postsRes.data,
    });

    return {
      followers: followersRes.data?.followers_count || 0,
      following: followingRes.data?.following_count || 0,
      posts: postsRes.data?.media_count || 0,
    };
  } catch (err) {
    console.error("❌ Failed to fetch Instagram counts:", err);
    return null;
  }
}

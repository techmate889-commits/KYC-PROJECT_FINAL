/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import axios from "axios";

const RAPIDAPI_HOST = "instagram-scraper-api2.p.rapidapi.com";
const RAPIDAPI_KEY = "33937bf8d8msha8965d6b2c1a8d7p19b941jsn4b71b369e997"; // your key

export interface InstagramCounts {
  followers: number;
  following: number;
  posts: number;
}

/**
 * Fetch exact Instagram counts using RapidAPI.
 * @param username Instagram handle (without @)
 */
export async function fetchInstagramCounts(
  username: string
): Promise<InstagramCounts | null> {
  try {
    const res = await axios.get(
      `https://${RAPIDAPI_HOST}/v1/info?username_or_id_or_url=${username}`,
      {
        headers: {
          "X-RapidAPI-Host": RAPIDAPI_HOST,
          "X-RapidAPI-Key": RAPIDAPI_KEY,
        },
      }
    );

    const data = res.data;

    return {
      followers: data.followers_count,
      following: data.following_count,
      posts: data.media_count,
    };
  } catch (err) {
    console.error("Failed to fetch Instagram counts:", err);
    return null;
  }
}

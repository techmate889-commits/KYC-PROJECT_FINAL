/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SocialMediaAccount {
  platform: string;
  handle: string;
  followers: string | "Not Publicly Available";
  url: string | "Not Publicly Available";
}

export interface LatestPost {
  caption: string | "Not Publicly Available";
  likes: number | null;
  comments: number | null;
  views: number | null;
  engagement: string | "Not Publicly Available";
  postedAt: string | "Not Publicly Available";
}

export interface ContentQuality {
  rating: "High" | "Medium" | "Low" | "Not Publicly Available";
  notes: string | "Not Publicly Available";
}

export interface ProfileData {
  id: string;
  instagramUsername: string;
  instagramHandle: string;
  fullName: string | "Not Publicly Available";
  dateOfBirth: string | "Not Publicly Available";
  age: number | null;
  profilePictureUrl: string | "Not Publicly Available";
  profession: string | "Not Publicly Available";
  education: string | "Not Publicly Available";
  interests: string[]; // normalized list
  familyInfo: string | "Not Publicly Available";
  country: string | "Not Publicly Available";
  location: string | "Not Publicly Available";
  businessName: string | "Not Publicly Available";
  businessType: string | "Not Publicly Available";
  businessWebsite: string | "Not Publicly Available";
  businessOverview: string | "Not Publicly Available";
  businessAccountId: string | "Not Publicly Available";
  engagementRatio: string | "Not Publicly Available";
  postFrequency: string | "Not Publicly Available";
  contentType: string | "Not Publicly Available";
  contentQuality: ContentQuality;
  latestPosts: LatestPost[];
  otherSocialMedia: SocialMediaAccount[];
  awards: string | "Not Publicly Available";
  mediaCoverage: string | string[] | "Not Publicly Available";
  incomeOrNetWorth: string | "Not Publicly Available";   // ✅ NEW FIELD
  intro: string | "Not Publicly Available";
  enrichedSources: string[];   // ✅ list of URLs/sources used
  confidenceScore: number;     // ✅ 0–100
  instagramFollowers: string | "Not Publicly Available";
  instagramFollowing: string | "Not Publicly Available";
  instagramPostsCount: string | "Not Publicly Available";
  lastFetched: string;
}

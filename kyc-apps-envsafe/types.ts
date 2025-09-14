/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProfileData {
  id: string;
  instagramUsername: string;
  instagramHandle: string;
  fullName: string;
  dateOfBirth: string;
  age: number | null;
  profilePictureUrl: string;
  profession: string;
  education: string;
  interests: string[];
  familyInfo: string;
  country: string;
  location: string;
  businessName: string;
  businessType: string;
  businessWebsite: string;
  businessOverview: string;
  businessAccountId: string;
  instagramFollowers: string;
  instagramFollowing: string;
  instagramPostsCount: string;
  engagementRatio: string;
  postFrequency: string;
  contentType: string;
  contentQuality: {
    rating: string;
    notes: string;
  };
  latestPosts: {
    caption: string;
    likes: number | null;
    comments: number | null;
    views: number | null;
    engagement: string;
    postedAt: string;
  }[];
  otherSocialMedia: {
    platform: string;
    handle: string;
    followers: string;
    url: string;
  }[];
  awards: string;
  mediaCoverage: string | string[];
  incomeOrNetWorth: string;  // ✅ NEW FIELD
  intro: string;
  enrichedSources: string[];
  confidenceScore: number;
  lastFetched: string;
}

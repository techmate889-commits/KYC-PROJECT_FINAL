/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface ContentQuality {
  rating: string;         // High | Medium | Low
  notes: string;          // Short notes
}

export interface LatestPost {
  engagement: string;     // e.g., "1.2K Likes, 85 Comments, 20K Views"
}

export interface SocialMedia {
  platform: string;       // e.g., "YouTube"
  handle: string;         // e.g., "@channel"
  followers: string;      // e.g., "120K"
}

export interface ProfileData {
  id?: string;
  lastFetched?: string;

  // Core identity
  profilePictureUrl?: string;
  intro?: string;
  instagramUsername?: string;
  fullName?: string;
  dateOfBirth?: string;
  profession?: string;
  education?: string;
  country?: string;
  location?: string;
  familyInfo?: string;
  interests?: string;

  // Instagram stats
  instagramHandle?: string;
  instagramFollowers?: string;
  instagramFollowing?: string;
  instagramPostsCount?: string;
  engagementRatio?: string;
  latestPosts?: LatestPost[];
  contentType?: string;
  contentQuality?: ContentQuality;
  postFrequency?: string;

  // Business
  businessName?: string;
  businessAccountId?: string;
  businessWebsite?: string;
  otherSocialMedia?: SocialMedia[];
  businessOverview?: string;
  businessType?: string;
  awards?: string;
  mediaCoverage?: string;
}

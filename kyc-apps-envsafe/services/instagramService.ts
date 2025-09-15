export interface ProfileData {
  id: string;
  instagramUsername: string;
  instagramHandle: string;
  fullName: string;
  dateOfBirth: string | "Not Publicly Available";
  age?: number | null;
  profilePictureUrl: string | "Not Publicly Available";
  profession: string | "Not Publicly Available";
  education: string | "Not Publicly Available";
  interests: string[] | [];
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
  contentQuality: { rating: string; notes: string };
  otherSocialMedia: { platform: string; handle: string; followers: string; url: string }[];
  awards: string | "Not Publicly Available";
  mediaCoverage: string | [string] | "Not Publicly Available";
  incomeOrNetWorth: string | "Not Publicly Available";
  intro: string;
  enrichedSources: string[];
  confidenceScore: number;
  lastFetched: string;
  instagramFollowers: string;
  instagramFollowing: string;
  instagramPostsCount: string;

  // ✅ New field
  recentPosts?: {
    caption: string;
    likes: number;
    comments: number;
    views: number | null;
    postedAt: string;
  }[];
}

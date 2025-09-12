// types.ts
// Central type definitions for the KYC System

export interface ProfileData {
  // --- Basic Identity ---
  instagramUsername: string;
  instagramHandle: string;        // can be same as username or numeric ID
  fullName: string;
  dateOfBirth?: string;           // e.g. "1995-02-12"
  age?: number;                   // auto-calculated
  profilePictureUrl?: string;

  // --- Personal Info ---
  profession?: string;
  education?: string;
  interests?: string[];
  familyInfo?: string;
  country?: string;
  location?: string;              // City/Region

  // --- Business Info ---
  businessName?: string;
  businessType?: "Product" | "Service" | "Coaching" | "Other";
  businessWebsite?: string;
  businessOverview?: string;
  businessAccountId?: string;

  // --- Instagram Stats ---
  instagramFollowers: string;
  instagramFollowing: string;
  instagramPostsCount: string;
  engagementRatio?: string;       // %
  postFrequency?: string;         // e.g. "3 posts/week"
  contentType?: "Personal" | "Business" | "Random";
  contentQuality?: {
    rating: "High" | "Medium" | "Low";
    notes?: string;
  };

  // --- Latest Posts ---
  latestPosts?: {
    caption?: string;
    likes?: number;
    comments?: number;
    views?: number;
    engagement?: string;          // formatted: "Likes: X, Comments: Y, Views: Z"
    postedAt?: string;            // timestamp
  }[];

  // --- External Links & Accounts ---
  otherSocialMedia?: {
    platform: string;             // e.g. Twitter, LinkedIn, YouTube
    handle: string;
    followers?: string;
    url?: string;
  }[];

  // --- Recognition ---
  awards?: string;
  mediaCoverage?: string | string[]; // plain text or list of article links

  // --- AI/Enrichment Fields ---
  intro?: string;                 // Executive summary auto-generated
  enrichedSources?: string[];     // list of sources used (IG, LinkedIn, Google News, etc.)
  confidenceScore?: number;       // 0-100 → how confident the system is
  lastFetched: string;            // timestamp
}

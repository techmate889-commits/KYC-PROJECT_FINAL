/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from "react";
import { ProfileData } from "../types";
import jsPDF from "jspdf";
import {
  UserCircleIcon,
  BriefcaseIcon,
  ChartBarIcon,
  AtSymbolIcon,
  MegaphoneIcon,
  GlobeAltIcon,
  DocumentDownloadIcon,
} from "./icons";

interface ProfileReportProps {
  profile: ProfileData;
}

const ReportSection: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode }> = ({
  title,
  children,
  icon,
}) => (
  <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden break-inside-avoid">
    <div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
      {icon}
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
    </div>
    <div className="p-4 md:p-6 space-y-4 text-sm">{children}</div>
  </div>
);

const InfoItem: React.FC<{ label: string; value?: any }> = ({ label, value }) => {
  let displayValue: string;

  if (value === null || value === undefined) {
    displayValue = "Not Publicly Available";
  } else if (Array.isArray(value)) {
    displayValue = value.length ? value.join(", ") : "Not Publicly Available";
  } else if (typeof value === "object") {
    displayValue = JSON.stringify(value, null, 2);
  } else {
    displayValue = value.toString() || "Not Publicly Available";
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4">
      <span className="font-semibold text-slate-600 dark:text-slate-400 md:col-span-1">{label}:</span>
      <div className="md:col-span-2 text-slate-800 dark:text-slate-300 whitespace-pre-wrap">{displayValue}</div>
    </div>
  );
};

const StatItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="text-center">
    <p className="text-2xl font-bold text-slate-800 dark:text-white">{value || "Not Publicly Available"}</p>
    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
  </div>
);

/* --- Helpers --- */
function formatDOBWithAge(dob?: string, age?: number | null): string {
  if (!dob || dob === "Not Publicly Available") return "Not Publicly Available";
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return dob;
  const calcAge = age || new Date().getFullYear() - birth.getFullYear();
  return `${dob} (Age: ${calcAge})`;
}

const renderWebsiteLinks = (urls: string) => {
  if (!urls || urls === "Not Publicly Available") return "Not Publicly Available";
  const urlArray = urls
    .split(/[\s,]+/)
    .map((u) => u.trim())
    .filter((u) => u.startsWith("http://") || u.startsWith("https://"));
  if (urlArray.length === 0) return urls;
  return (
    <ul className="space-y-1">
      {urlArray.map((url, i) => (
        <li key={i}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline break-all"
          >
            {url}
          </a>
        </li>
      ))}
    </ul>
  );
};

const normalizeList = (value: string | string[] | undefined): string[] => {
  if (!value) return ["Not Publicly Available"];
  if (Array.isArray(value)) return value.length ? value : ["Not Publicly Available"];
  return value.split(/[,|/]+/).map((v) => v.trim()).filter(Boolean);
};

const ProfileReport: React.FC<ProfileReportProps> = ({ profile }) => {
  const [isExporting, setIsExporting] = useState(false);
  if (!profile) return null;

  const publicPosts = profile.latestPosts || [];

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.text("Client KYC Report", 105, 20, { align: "center" });
      pdf.save(
        `${(profile.fullName || "kyc-report")
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase()}_report.pdf`
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div id="web-report">
        <div className="space-y-6">
          {/* Hero */}
          <header className="relative bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 flex flex-col sm:flex-row items-center gap-6">
            {profile.profilePictureUrl &&
            profile.profilePictureUrl !== "Not Publicly Available" ? (
              <img
                src={profile.profilePictureUrl}
                alt={profile.fullName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-lg"
              />
            ) : (
              <UserCircleIcon className="w-24 h-24 sm:w-28 sm:h-28 text-slate-300 dark:text-slate-600" />
            )}
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {profile.fullName || "Not Publicly Available"}
              </h2>
              <p className="text-lg sm:text-xl text-blue-500 dark:text-blue-400 font-medium">
                {profile.instagramUsername || "Not Publicly Available"}
              </p>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-700 max-w-sm mx-auto sm:mx-0">
                  <StatItem label="Followers" value={profile.instagramFollowers} />
                  <StatItem label="Following" value={profile.instagramFollowing} />
                  <StatItem label="Posts" value={profile.instagramPostsCount} />
                </div>
              </div>
            </div>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="absolute top-4 right-4 sm:relative sm:top-auto sm:right-auto self-start sm:self-center inline-flex items-center gap-2 px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400"
            >
              <DocumentDownloadIcon className="h-5 w-5" />
              {isExporting ? "Exporting..." : "Export PDF"}
            </button>
          </header>

          {/* Executive Summary */}
          <ReportSection title="Executive Summary" icon={<BriefcaseIcon className="h-5 w-5 mr-3 text-slate-400" />}>
            <InfoItem label="Intro" value={profile.intro} />
          </ReportSection>

          {/* Personal Info */}
          <ReportSection title="Personal Information" icon={<UserCircleIcon className="h-5 w-5 mr-3 text-slate-400" />}>
            <InfoItem label="Full Name" value={profile.fullName} />
            <InfoItem label="Date of Birth" value={formatDOBWithAge(profile.dateOfBirth, profile.age)} />
            <InfoItem label="Profession" value={profile.profession} />
            <InfoItem label="Education" value={profile.education} />
            <InfoItem label="Location" value={`${profile.location}, ${profile.country}`} />
            <InfoItem label="Family Info" value={profile.familyInfo} />
            <InfoItem label="Interests" value={normalizeList(profile.interests).join(", ")} />
            <InfoItem label="Income / Net Worth" value={profile.incomeOrNetWorth} />
          </ReportSection>

          {/* Business Info */}
          <ReportSection title="Business Information" icon={<BriefcaseIcon className="h-5 w-5 mr-3 text-slate-400" />}>
            <InfoItem label="Business Name" value={profile.businessName} />
            <InfoItem label="Business Type" value={profile.businessType} />
            <InfoItem label="Website" value={renderWebsiteLinks(profile.businessWebsite)} />
            <InfoItem label="Website Title" value={profile.businessWebsiteInfo?.title} />
            <InfoItem label="Website Description" value={profile.businessWebsiteInfo?.description} />
            <InfoItem label="Overview" value={profile.businessOverview} />
            <InfoItem label="Business Account ID" value={profile.businessAccountId} />
          </ReportSection>

          {/* Instagram Analysis */}
          <ReportSection title="Instagram Analysis" icon={<ChartBarIcon className="h-5 w-5 mr-3 text-slate-400" />}>
            <InfoItem label="Handle" value={profile.instagramHandle} />
            <InfoItem label="Engagement Ratio" value={profile.engagementRatio} />
            <InfoItem label="Post Frequency" value={profile.postFrequency} />
            <InfoItem label="Content Type" value={profile.contentType} />
            <InfoItem label="Content Quality" value={profile.contentQuality?.rating} />
            <InfoItem label="Notes" value={profile.contentQuality?.notes} />
          </ReportSection>

          {/* Latest Posts */}
          <ReportSection title="Latest Posts Engagement" icon={<AtSymbolIcon className="h-5 w-5 mr-3 text-slate-400" />}>
            {publicPosts.length > 0 ? (
              <ul className="space-y-2">
                {publicPosts.map((post, index) => (
                  <li key={index} className="text-sm text-slate-600 dark:text-slate-400">
                    <strong>Post {index + 1}:</strong>{" "}
                    {`Caption: ${post.caption || "Not Publicly Available"} | Likes: ${
                      post.likes ?? "Not Publicly Available"
                    } | Comments: ${post.comments ?? "Not Publicly Available"} | Views: ${
                      post.views ?? "Not Publicly Available"
                    } | Engagement: ${post.engagement || "Not Publicly Available"} | Date: ${
                      post.postedAt || "Not Publicly Available"
                    }`}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 italic">Not Publicly Available</p>
            )}
          </ReportSection>

          {/* Other Social Media */}
          <ReportSection title="Other Social Media" icon={<GlobeAltIcon className="h-5 w-5 mr-3 text-slate-400" />}>
            {profile.otherSocialMedia?.length > 0 ? (
              profile.otherSocialMedia.map((acc, index) => (
                <div key={index}>
                  <InfoItem label="Platform" value={acc.platform} />
                  <InfoItem label="Handle" value={acc.handle} />
                  <InfoItem label="Followers" value={acc.followers} />
                  <InfoItem label="URL" value={renderWebsiteLinks(acc.url)} />
                </div>
              ))
            ) : (
              <p className="text-slate-500 dark:text-slate-400 italic">Not Publicly Available</p>
            )}
          </ReportSection>

          {/* Awards & Media */}
          <ReportSection title="Awards & Media" icon={<MegaphoneIcon className="h-5 w-5 mr-3 text-slate-400" />}>
            <InfoItem label="Awards" value={profile.awards} />
            <InfoItem label="Media Coverage" value={profile.mediaCoverage} />
          </ReportSection>

          {/* Recent News */}
          <ReportSection title="Recent News" icon={<MegaphoneIcon className="h-5 w-5 mr-3 text-slate-400" />}>
            {profile.recentNews?.length > 0 ? (
              <ul className="space-y-1">
                {profile.recentNews.map((news, i) => (
                  <li key={i}>{news}</li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 italic">Not Publicly Available</p>
            )}
          </ReportSection>

          {/* Analysis & Sources */}
          <ReportSection title="Analysis & Sources" icon={<ChartBarIcon className="h-5 w-5 mr-3 text-slate-400" />}>
            <InfoItem label="Confidence Score" value={profile.confidenceScore?.toString()} />
            <InfoItem label="Enriched Sources" value={normalizeList(profile.enrichedSources).join(", ")} />
            <InfoItem label="Last Fetched" value={profile.lastFetched} />
          </ReportSection>
        </div>
      </div>
    </div>
  );
};

export default ProfileReport;

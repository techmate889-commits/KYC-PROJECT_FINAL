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

const ReportSection: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ title, children, icon }) => (
  <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden break-inside-avoid">
    <div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
      {icon}
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
    </div>
    <div className="p-4 md:p-6 space-y-4 text-sm">{children}</div>
  </div>
);

const InfoItem: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => {
  if (!value || value === "Not Publicly Available" || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4">
      <span className="font-semibold text-slate-600 dark:text-slate-400 md:col-span-1">{label}:</span>
      <div className="md:col-span-2 text-slate-800 dark:text-slate-300 whitespace-pre-wrap">{value}</div>
    </div>
  );
};

const StatItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="text-center">
    <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
  </div>
);

/* --- Helpers --- */
function formatDOBWithAge(dob?: string): string {
  if (!dob || dob === "Not Publicly Available") return "Not Publicly Available";
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return dob;
  const age = new Date().getFullYear() - birth.getFullYear();
  return `${dob} (Age: ${age})`;
}

// Split & clean multiple URLs
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
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
            {url}
          </a>
        </li>
      ))}
    </ul>
  );
};

// Normalize comma/space separated values
const normalizeList = (value: string | string[] | undefined): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.split(/[,|/]+/).map((v) => v.trim()).filter(Boolean);
};

const ProfileReport: React.FC<ProfileReportProps> = ({ profile }) => {
  const [isExporting, setIsExporting] = useState(false);
  if (!profile) return null;

  const publicPosts = profile.latestPosts?.filter((p) => p.engagement !== "Not Publicly Available");
  const scrapedPosts = profile.recentPosts || []; // ✅ from scraper

  /* --- PDF EXPORT --- */
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const FONT = "Helvetica";
      const FONT_SIZES = { title: 22, heading: 16, body: 10 };
      const MARGINS = { top: 20, left: 20, right: 20 };
      const PAGE_WIDTH = pdf.internal.pageSize.getWidth();
      const contentWidth = PAGE_WIDTH - MARGINS.left - MARGINS.right;
      let yPos = MARGINS.top;

      const renderInfoItem = (label: string, value?: string | string[]) => {
        if (!value || value === "Not Publicly Available") return;
        const cleanVal = Array.isArray(value) ? value.join(", ") : value;
        const valueLines = pdf.splitTextToSize(cleanVal, contentWidth - 35);
        pdf.setFont(FONT, "bold");
        pdf.setFontSize(FONT_SIZES.body);
        pdf.text(label + ":", MARGINS.left, yPos);
        pdf.setFont(FONT, "normal");
        pdf.text(valueLines, MARGINS.left + 35, yPos);
        yPos += valueLines.length * 5 + 3;
      };

      // Title Page
      pdf.setFont(FONT, "bold");
      pdf.setFontSize(FONT_SIZES.title);
      pdf.text("Client KYC Report", PAGE_WIDTH / 2, 80, { align: "center" });
      pdf.setFontSize(FONT_SIZES.heading);
      pdf.text(profile.fullName, PAGE_WIDTH / 2, 100, { align: "center" });

      // Content
      pdf.addPage();
      renderInfoItem("Full Name", profile.fullName);
      renderInfoItem("Profession", profile.profession);
      renderInfoItem("Education", profile.education);
      renderInfoItem("Location", `${profile.location}, ${profile.country}`);
      renderInfoItem("Income / Net Worth", profile.incomeOrNetWorth);
      renderInfoItem("Business Website", profile.businessWebsite);

      pdf.save(`${(profile.fullName || "kyc-report").replace(/[^a-z0-9]/gi, "_").toLowerCase()}_report.pdf`);
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
            {profile.profilePictureUrl && profile.profilePictureUrl !== "Not Publicly Available" ? (
              <img src={profile.profilePictureUrl} alt={profile.fullName} className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-lg" />
            ) : (
              <UserCircleIcon className="w-24 h-24 sm:w-28 sm:h-28 text-slate-300 dark:text-slate-600" />
            )}
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{profile.fullName}</h2>
              <p className="text-lg sm:text-xl text-blue-500 dark:text-blue-400 font-medium">{profile.instagramUsername}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 italic">{profile.bio}</p> {/* ✅ Scraper bio */}
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
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">{profile.intro}</p>
          </ReportSection>

          {/* Instagram Recent Posts (Scraper) */}
          <ReportSection title="Recent Instagram Posts" icon={<AtSymbolIcon className="h-5 w-5 mr-3 text-slate-400" />}>
            {scrapedPosts.length > 0 ? (
              <ul className="space-y-2">
                {scrapedPosts.map((post, i) => (
                  <li key={i} className="text-sm text-slate-600 dark:text-slate-400">
                    <strong>Post {i + 1}:</strong> {post.caption || "(No caption)"} <br />
                    ❤️ {post.likes} · 💬 {post.comments} {post.views ? `· ▶️ ${post.views} views` : ""} <br />
                    <span className="text-xs text-slate-500">{new Date(post.postedAt).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 italic">No recent post data available.</p>
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
              <p className="text-slate-500 dark:text-slate-400 italic">No other public social media accounts found.</p>
            )}
          </ReportSection>

          {/* Awards & Media */}
          <ReportSection title="Awards & Media" icon={<MegaphoneIcon className="h-5 w-5 mr-3 text-slate-400" />}>
            <InfoItem label="Awards" value={profile.awards} />
            <InfoItem label="Media Coverage" value={profile.mediaCoverage} />
          </ReportSection>
        </div>
      </div>
    </div>
  );
};

export default ProfileReport;

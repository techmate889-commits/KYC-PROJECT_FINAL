/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { ProfileData } from '../types';
import jsPDF from 'jspdf';
import {
  UserCircleIcon,
  BriefcaseIcon,
  ChartBarIcon,
  AtSymbolIcon,
  MegaphoneIcon,
  GlobeAltIcon,
  DocumentDownloadIcon,
} from './icons';

interface ProfileReportProps {
  profile: ProfileData;
}

const ReportSection: React.FC<{ title: string, children: React.ReactNode, icon?: React.ReactNode }> = ({ title, children, icon }) => (
  <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden break-inside-avoid">
    <div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
      {icon}
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
    </div>
    <div className="p-4 md:p-6 space-y-4 text-sm">{children}</div>
  </div>
);

const InfoItem: React.FC<{ label: string, value?: React.ReactNode }> = ({ label, value }) => {
  if (!value || value === 'Not Publicly Available' || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4">
      <span className="font-semibold text-slate-600 dark:text-slate-400 md:col-span-1">{label}:</span>
      <div className="md:col-span-2 text-slate-800 dark:text-slate-300 whitespace-pre-wrap">{value}</div>
    </div>
  );
};

const StatItem: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="text-center">
    <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
  </div>
);

const BadgeField: React.FC<{ label: string, value?: string }> = ({ label, value }) => {
  if (!value || value === 'Not Publicly Available') return null;
  const colors =
    value.toLowerCase().includes("high") ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" :
    value.toLowerCase().includes("medium") ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200" :
    value.toLowerCase().includes("low") ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200" :
    "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200";

  return (
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-md ${colors}`}>{value}</span>
    </div>
  );
};

const ProgressBar: React.FC<{ label: string, value?: string }> = ({ label, value }) => {
  if (!value || value === 'Not Publicly Available') return null;
  const num = parseFloat(value);
  const percentage = isNaN(num) ? 0 : num;
  return (
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
        <div
          className="h-3 rounded-full bg-blue-500"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <p className="text-xs mt-1 text-slate-600 dark:text-slate-400">{percentage}%</p>
    </div>
  );
};

function formatDOBWithAge(dob?: string): string {
  if (!dob || dob === "Not Publicly Available") return "Not Publicly Available";
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return dob;
  const age = new Date().getFullYear() - birth.getFullYear();
  return `${dob} (Age: ${age})`;
}

const renderWebsiteLink = (url: string) => {
  if (!url || url === "Not Publicly Available") return "Not Publicly Available";
  return <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">{url}</a>;
};

const ProfileReport: React.FC<ProfileReportProps> = ({ profile }) => {
  const [isExporting, setIsExporting] = useState(false);

  if (!profile) return null;

  const publicPosts = profile.latestPosts?.filter(p => p.engagement !== "Not Publicly Available");

  /* --- PDF EXPORT FUNCTION --- */
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const FONT = 'Helvetica';
      const FONT_SIZES = { title: 22, heading: 16, subHeading: 12, body: 10, footer: 8 };
      const MARGINS = { top: 20, bottom: 20, left: 20, right: 20 };
      const PAGE_WIDTH = pdf.internal.pageSize.getWidth();
      const PAGE_HEIGHT = pdf.internal.pageSize.getHeight();
      const contentWidth = PAGE_WIDTH - MARGINS.left - MARGINS.right;
      let yPos = MARGINS.top;
      let page = 1;

      const addHeaderAndFooter = (isTitlePage = false) => {
        if (isTitlePage) return;
        pdf.setFont(FONT, 'normal');
        pdf.setFontSize(FONT_SIZES.footer);
        pdf.setTextColor(100);
        pdf.text(`KYC Report: ${profile.fullName}`, MARGINS.left, MARGINS.top / 2);
        const footerText = `Page ${page} | Generated: ${new Date().toLocaleDateString()}`;
        pdf.text(footerText, MARGINS.left, PAGE_HEIGHT - MARGINS.bottom / 2);
      };

      const checkAndAddPage = (requiredHeight: number) => {
        if (yPos + requiredHeight > PAGE_HEIGHT - MARGINS.bottom) {
          addHeaderAndFooter();
          pdf.addPage();
          page++;
          yPos = MARGINS.top;
          addHeaderAndFooter();
        }
      };

      const renderSectionTitle = (title: string) => {
        checkAndAddPage(15);
        pdf.setFont(FONT, 'bold');
        pdf.setFontSize(FONT_SIZES.heading);
        pdf.setTextColor(40);
        pdf.text(title, MARGINS.left, yPos);
        yPos += 5;
        pdf.setDrawColor(200);
        pdf.line(MARGINS.left, yPos, PAGE_WIDTH - MARGINS.right, yPos);
        yPos += 8;
      };

      const renderInfoItem = (label: string, value?: string) => {
        if (!value || value === 'Not Publicly Available') return;
        const valueLines = pdf.splitTextToSize(String(value), contentWidth - 35);
        const requiredHeight = valueLines.length * 5 + 3;
        checkAndAddPage(requiredHeight);
        pdf.setFont(FONT, 'bold');
        pdf.setFontSize(FONT_SIZES.body);
        pdf.setTextColor(80);
        pdf.text(label + ':', MARGINS.left, yPos);
        pdf.setFont(FONT, 'normal');
        pdf.setTextColor(40);
        pdf.text(valueLines, MARGINS.left + 35, yPos);
        yPos += valueLines.length * 5 + 3;
      };

      // --- TITLE PAGE ---
      pdf.setFont(FONT, 'bold');
      pdf.setFontSize(FONT_SIZES.title + 4);
      pdf.text('Client KYC Report', PAGE_WIDTH / 2, 80, { align: 'center' });
      pdf.setFontSize(FONT_SIZES.heading);
      pdf.text(profile.fullName, PAGE_WIDTH / 2, 100, { align: 'center' });
      pdf.setFont(FONT, 'normal');
      pdf.setFontSize(FONT_SIZES.subHeading);
      pdf.text(profile.instagramUsername, PAGE_WIDTH / 2, 110, { align: 'center' });
      pdf.text(`Report Generated: ${new Date().toLocaleString()}`, PAGE_WIDTH / 2, 130, { align: 'center' });
      addHeaderAndFooter(true);

      // --- CONTENT ---
      pdf.addPage();
      page++;
      addHeaderAndFooter();

      renderSectionTitle('Personal Information');
      renderInfoItem('Full Name', profile.fullName);
      if (profile.dateOfBirth) renderInfoItem('Date of Birth', formatDOBWithAge(profile.dateOfBirth));
      renderInfoItem('Profession', profile.profession);
      renderInfoItem('Location', `${profile.location}, ${profile.country}`);
      renderInfoItem('Family Info', profile.familyInfo);
      renderInfoItem('Education', profile.education);
      renderInfoItem('Interests', profile.interests);

      renderSectionTitle('Business Information');
      renderInfoItem('Business Name', profile.businessName);
      renderInfoItem('Business Type', profile.businessType);
      renderInfoItem('Website', profile.businessWebsite);
      if (profile.businessOverview) {
        const lines = pdf.splitTextToSize(profile.businessOverview, contentWidth);
        pdf.text(lines, MARGINS.left, yPos);
        yPos += lines.length * 5 + 5;
      }

      renderSectionTitle('Instagram Analysis');
      renderInfoItem('Handle', profile.instagramHandle);
      if (profile.engagementRatio) renderInfoItem('Engagement Ratio', profile.engagementRatio + "%");
      renderInfoItem('Post Frequency', profile.postFrequency);
      renderInfoItem('Content Type', profile.contentType);
      if (profile.contentQuality?.rating) renderInfoItem('Content Quality', `${profile.contentQuality.rating} - ${profile.contentQuality.notes || ""}`);

      if (publicPosts?.length > 0) {
        renderSectionTitle('Latest Posts Engagement');
        publicPosts.forEach((post, index) => renderInfoItem(`Post ${index + 1}`, post.engagement));
      }

      if (profile.otherSocialMedia?.length > 0) {
        renderSectionTitle('Other Social Media');
        profile.otherSocialMedia.forEach(acc => {
          const text = `Platform: ${acc.platform}, Handle: ${acc.handle}, Followers: ${acc.followers}`;
          const lines = pdf.splitTextToSize(text, contentWidth);
          pdf.text(lines, MARGINS.left, yPos);
          yPos += lines.length * 5 + 2;
        });
      }

      renderSectionTitle('Awards & Media');
      renderInfoItem('Awards', profile.awards);
      if (profile.mediaCoverage && profile.mediaCoverage.startsWith("http")) {
        pdf.setTextColor(0, 102, 204);
        pdf.textWithLink("Media Coverage Link", MARGINS.left, yPos, { url: profile.mediaCoverage });
        pdf.setTextColor(40);
        yPos += 8;
      } else {
        renderInfoItem('Media Coverage', profile.mediaCoverage);
      }

      const safeFileName = (profile.fullName || 'kyc-report').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      pdf.save(`${safeFileName}_report.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
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
              className="absolute top-4 right-4 sm:relative sm:top-auto sm:right-auto self-start sm:self-center inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              <DocumentDownloadIcon className="h-5 w-5" />
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </button>
          </header>

          {/* Executive Summary */}
          <ReportSection title="Executive Summary" icon={<BriefcaseIcon className="h-5 w-5 mr-3 text-slate-400" />}>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">{profile.intro}</p>
          </ReportSection>

          {/* Personal Info */}
          <ReportSection title="Personal Information" icon={<UserCircleIcon className="h-5 w-5 mr-3 text-slate-400" />}>
            <InfoItem label="Full Name" value={profile.fullName} />
            <InfoItem label="Date of Birth" value={formatDOBWithAge(profile.dateOfBirth)} />
            <InfoItem label="Profession" value={profile.profession} />
            <InfoItem label="Location" value={`${profile.location}, ${profile.country}`} />
            <InfoItem label="Family Info" value={profile.familyInfo} />
            <InfoItem label="Education" value={profile.education} />
            <InfoItem label="Interests" value={profile.interests} />
          </ReportSection>

          {/* Business Info */}
          <ReportSection title="Business Information" icon={<BriefcaseIcon className="h-5 w-5 mr-3 text-slate-400" />}>
            <InfoItem label="Business Name" value={profile.businessName} />
            <InfoItem label="Business Type" value={profile.businessType} />
            <InfoItem label="Website" value={renderWebsiteLink(profile.businessWebsite)} />
            {profile.businessOverview && (
              <div className="mt-3 p-3 rounded-md bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                {profile.businessOverview}
              </div>
            )}
          </ReportSection>

          {/* Instagram Analysis */}
          <ReportSection title="Instagram Analysis" icon={<ChartBarIcon className="h-5 w-5 mr-3 text-slate-400" />}>
            <InfoItem label="Handle" value={profile.instagramHandle} />
            <ProgressBar label="Engagement Ratio" value={profile.engagementRatio} />
            <BadgeField label="Post Frequency" value={profile.postFrequency} />
            <BadgeField label="Content Type" value={profile.contentType} />
            <BadgeField label="Quality" value={profile.contentQuality?.rating} />
            {profile.contentQuality?.notes && <p className="text-xs text-slate-500 dark:text-slate-400">{profile.contentQuality.notes}</p>}
          </ReportSection>

          {/* Latest Posts */}
          <ReportSection title="Latest Posts Engagement" icon={<AtSymbolIcon className="h-5 w-5 mr-3 text-slate-400" />}>
            {publicPosts?.length > 0 ? (
              <ul className="space-y-2">
                {publicPosts.map((post, index) => (
                  <li key={index} className="text-sm text-slate-600 dark:text-slate-400">
                    <strong>Post {index + 1}:</strong> {post.engagement}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 italic">No public post engagement data available.</p>
            )}
          </ReportSection>

          {/* Other Social Media */}
          <ReportSection title="Other Social Media" icon={<GlobeAltIcon className="h-5 w-5 mr-3 text-slate-400" />}>
            {profile.otherSocialMedia?.length > 0 ? profile.otherSocialMedia.map((acc, index) => (
              <div key={index} className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3 first:border-t-0 first:pt-0 first:mt-0">
                <InfoItem label="Platform" value={acc.platform} />
                <InfoItem label="Handle" value={acc.handle} />
                <InfoItem label="Followers" value={acc.followers} />
              </div>
            )) : (
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
      <footer className="text-center text-xs text-slate-500 dark:text-slate-600 pt-8 mt-8 border-t border-slate-200 dark:border-slate-800">
        Report generated on: {new Date(profile.lastFetched).toLocaleString()}
      </footer>
    </div>
  );
};

export default ProfileReport;

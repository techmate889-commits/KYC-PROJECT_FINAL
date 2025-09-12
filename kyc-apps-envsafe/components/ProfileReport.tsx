/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import type { ProfileData } from "../types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { User, MapPin, Briefcase, BookOpen, Globe, Award, Users, Camera, Activity } from "lucide-react";

export default function ProfileReport({ profile }: { profile: ProfileData | null }) {
  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 rounded-2xl shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {profile.profilePictureUrl && (
          <img
            src={profile.profilePictureUrl}
            alt="Profile"
            className="w-20 h-20 rounded-full border-2 border-slate-300 dark:border-slate-700"
          />
        )}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">@{profile.instagramUsername}</h2>
          <p className="text-slate-600 dark:text-slate-300">{profile.intro || "No description available"}</p>
        </div>
      </div>

      {/* Personal Info */}
      <Section title="Personal Information">
        <Field icon={<User size={16} />} label="Full Name" value={profile.fullName} />
        <Field icon={<Briefcase size={16} />} label="Profession" value={profile.profession} />
        <Field icon={<BookOpen size={16} />} label="Education" value={profile.education} />
        <Field icon={<MapPin size={16} />} label="Location" value={`${profile.location || ""}, ${profile.country || ""}`} />
      </Section>

      {/* Instagram Stats */}
      <Section title="Instagram Stats">
        <Field icon={<Users size={16} />} label="Followers" value={profile.instagramFollowers} />
        <Field icon={<Users size={16} />} label="Following" value={profile.instagramFollowing} />
        <Field icon={<Camera size={16} />} label="Posts" value={profile.instagramPostsCount} />
        <Field icon={<Activity size={16} />} label="Engagement Ratio" value={profile.engagementRatio} />
      </Section>

      {/* Engagement Chart */}
      {profile.latestPosts && profile.latestPosts.length > 0 && (
        <Section title="Latest 5 Post Engagements">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={profile.latestPosts.map((p, i) => ({ name: `Post ${i + 1}`, value: parseEngagement(p.engagement) }))}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Section>
      )}

      {/* Business Info */}
      <Section title="Business Information">
        <Field icon={<Globe size={16} />} label="Business Name" value={profile.businessName} />
        <Field icon={<Globe size={16} />} label="Website" value={profile.businessWebsite} />
        <Field icon={<Briefcase size={16} />} label="Type" value={profile.businessType} />
        <Field icon={<Award size={16} />} label="Awards" value={profile.awards} />
      </Section>
    </div>
  );
}

/* Helper Components */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
      {icon}
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="font-medium text-slate-900 dark:text-white">{value || "-"}</p>
      </div>
    </div>
  );
}

/* Parse engagement like "1.2K Likes" → number */
function parseEngagement(text: string): number {
  if (!text) return 0;
  const match = text.match(/([\d,.]+)([KkMm]?)/);
  if (!match) return 0;
  let num = parseFloat(match[1].replace(/,/g, ""));
  if (match[2].toLowerCase() === "k") num *= 1000;
  if (match[2].toLowerCase() === "m") num *= 1000000;
  return num;
}

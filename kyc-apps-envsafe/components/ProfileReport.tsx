/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react'
import type { ProfileData } from '../types'

export default function ProfileReport({ profile }: { profile: ProfileData | null }){
  if(!profile) return null
  return (
    <div className="max-w-3xl mx-auto mt-6 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">@{profile.instagramUsername} — Profile</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <Field label="Full Name" value={profile.fullName} />
        <Field label="DOB" value={profile.dateOfBirth} />
        <Field label="Profession" value={profile.profession} />
        <Field label="Education" value={profile.education} />
        <Field label="Country" value={profile.country} />
        <Field label="City / Location" value={profile.location} />
        <Field label="Followers" value={profile.instagramFollowers} />
        <Field label="Following" value={profile.instagramFollowing} />
        <Field label="Posts" value={profile.instagramPostsCount} />
        <Field label="Engagement Ratio" value={profile.engagementRatio} />
        <Field label="Content Type" value={profile.contentType} />
        <Field label="Post Frequency" value={profile.postFrequency} />
        <Field label="Business Name" value={profile.businessName} />
        <Field label="Business Website" value={profile.businessWebsite} />
        <Field label="Business Type" value={profile.businessType} />
        <Field label="Awards & Recognition" value={profile.awards} />
        <Field label="Media Coverage" value={profile.mediaCoverage} />
      </div>

      {profile.contentQuality?.rating && (
        <div className="mt-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">Content Quality</h3>
          <p className="text-slate-700 dark:text-slate-300">{profile.contentQuality.rating} — {profile.contentQuality.notes}</p>
        </div>
      )}

      {profile.latestPosts && profile.latestPosts.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">Latest 5 Post Engagements</h3>
          <ul className="list-disc pl-5 text-slate-700 dark:text-slate-300">
            {profile.latestPosts.slice(0,5).map((p, i)=> (
              <li key={i}>{p.engagement}</li>
            ))}
          </ul>
        </div>
      )}

      {profile.otherSocialMedia && profile.otherSocialMedia.length>0 && (
        <div className="mt-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">Other Social Media</h3>
          <ul className="list-disc pl-5 text-slate-700 dark:text-slate-300">
            {profile.otherSocialMedia.map((s, i)=> (
              <li key={i}>{s.platform}: {s.handle} — {s.followers}</li>
            ))}
          </ul>
        </div>
      )}

      {profile.intro && (
        <div className="mt-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">Intro / Short Description</h3>
          <p className="text-slate-700 dark:text-slate-300">{profile.intro}</p>
        </div>
      )}
    </div>
  )
}

function Field({label, value}: {label: string, value?: string}){
  return (
    <div>
      <p className="text-slate-500 dark:text-slate-400">{label}</p>
      <p className="font-medium text-slate-900 dark:text-white">{value || '-'}</p>
    </div>
  )
}

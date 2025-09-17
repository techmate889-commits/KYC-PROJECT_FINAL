/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from "react";
import { SearchIcon } from "lucide-react"; // you already have lucide-react installed

export default function SearchForm({ onSearch }: { onSearch: (username: string) => void }) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      // ✅ Extract username if full URL is pasted
      let username = value.trim();
      if (username.includes("instagram.com")) {
        const match = username.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
        if (match) username = match[1];
      }
      onSearch(username.replace(/^@/, "")); // remove @ if user typed it
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center gap-6 w-full max-w-xl mx-auto mt-16 px-4"
    >
      {/* Heading */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Know Your Client 🔍
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-lg text-sm sm:text-base mx-auto">
          Get instant verified insights and KYC reports from any Instagram profile.
        </p>
      </div>

      {/* Input with icon */}
      <div className="relative w-full">
        <SearchIcon className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 dark:text-slate-500" />
        <input
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 
                     bg-white dark:bg-slate-900 px-10 py-3 
                     text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500
                     shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          placeholder="Enter Instagram username or profile link"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
                   text-white font-semibold py-3 text-lg shadow-md 
                   hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900
                   transition"
      >
        QuickCheck ⚡
      </button>
    </form>
  );
}

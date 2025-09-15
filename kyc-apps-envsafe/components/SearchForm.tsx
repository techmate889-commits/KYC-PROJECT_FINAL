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
      className="flex flex-col items-center justify-center gap-6 w-full max-w-xl mx-auto mt-16"
    >
      {/* Heading */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-blue">
          Know Your Client 🔍
        </h1>
        <p className="text-slate-300 max-w-lg text-sm sm:text-base">
          Get instant verified insights and KYC reports from any Instagram profile.
        </p>
      </div>

      {/* Input with icon */}
      <div className="relative w-full">
        <SearchIcon className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
        <input
          className="w-full rounded-lg border border-slate-600 dark:border-slate-700 bg-slate-900/70 px-10 py-3 text-white placeholder-slate-400 shadow-md focus:ring-2 focus:ring-pink-500"
          placeholder="Enter Instagram username or profile link"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold py-3 text-lg shadow-md hover:opacity-90 transition"
      >
        QuickCheck ⚡
      </button>
    </form>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from "react";

export default function SearchForm({ onSearch }: { onSearch: (username: string) => void }) {
  const [value, setValue] = useState("");

  // ✅ Normalize input (URL → username, @username → username, plain → same)
  const normalizeInput = (input: string): string => {
    if (!input) return "";

    let val = input.trim();

    // If full Instagram URL
    if (val.includes("instagram.com")) {
      try {
        const url = new URL(val);
        const parts = url.pathname.split("/").filter(Boolean);
        if (parts.length > 0) return parts[0]; // first part after /
      } catch {
        return val;
      }
    }

    // If starts with @
    if (val.startsWith("@")) {
      return val.slice(1);
    }

    return val;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const username = normalizeInput(value);
    if (username) {
      onSearch(username);
      setValue(""); // clear input after search
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center gap-4 w-full max-w-xl mx-auto mt-10"
    >
      {/* Search Input */}
      <input
        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500"
        placeholder="Enter Instagram username or profile link"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full rounded-md bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold py-3 text-lg shadow-md hover:opacity-90 transition"
      >
        QuickCheck ⚡
      </button>
    </form>
  );
}

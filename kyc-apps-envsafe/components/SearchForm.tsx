/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from "react";

export default function SearchForm({ onSearch }: { onSearch: (username: string) => void }) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim());
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
        placeholder="Enter Instagram username (without @)"
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

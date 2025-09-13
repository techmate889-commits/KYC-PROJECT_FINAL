/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import SearchForm from "./components/SearchForm";
import Spinner from "./components/Spinner";
import ProfileReport from "./components/ProfileReport";
import { fetchClientProfile } from "./services/geminiService";
import type { ProfileData } from "./types";

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  );
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ProfileData[]>([]);

  // Load history on mount
  useEffect(() => {
    const stored = localStorage.getItem("clientHistory");
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  // Update document theme
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Save new profile to history
  const addToHistory = (newProfile: ProfileData) => {
    setHistory((prev) => {
      const filtered = prev.filter((p) => p.id !== newProfile.id);
      const updated = [newProfile, ...filtered];
      localStorage.setItem("clientHistory", JSON.stringify(updated));
      return updated;
    });
  };

  // Remove a profile from history
  const removeFromHistory = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem("clientHistory", JSON.stringify(updated));
      return updated;
    });
  };

  // Handle new search
  const onSearch = async (username: string) => {
    setLoading(true);
    setError(null);
    setProfile(null);
    try {
      const data = await fetchClientProfile(username);
      setProfile(data);
      if (data) addToHistory(data);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <Header
        theme={theme}
        onThemeToggle={() =>
          setTheme((t) => (t === "dark" ? "light" : "dark"))
        }
      />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <SearchForm onSearch={onSearch} />
        {loading && <Spinner />}
        {error && <p className="mt-4 text-red-600">{error}</p>}
        <ProfileReport profile={profile} />

        {/* Client History Section */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">
            Client History
          </h2>
          {history.length > 0 ? (
            <ul className="space-y-2">
              {history.map((p) => (
                <li
                  key={p.id}
                  className="flex justify-between items-center p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
                >
                  <button
                    onClick={() => setProfile(p)}
                    className="flex-1 text-left truncate text-slate-700 dark:text-slate-300 hover:underline"
                  >
                    {p.instagramUsername || p.fullName}
                  </button>
                  <button
                    onClick={() => removeFromHistory(p.id)}
                    className="ml-3 text-red-500 hover:text-red-700 text-sm"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
              No history yet.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

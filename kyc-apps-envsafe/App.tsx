/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import SearchForm from "./components/SearchForm";
import Spinner from "./components/Spinner";
import ProfileReport from "./components/ProfileReport";
import Menu from "./components/Menu"; // NEW
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
  const [menuOpen, setMenuOpen] = useState(false); // NEW

  // Theme switch
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Save new profile to history
  const addToHistory = (newProfile: ProfileData) => {
    const stored = localStorage.getItem("clientHistory");
    const prev = stored ? JSON.parse(stored) : [];
    const filtered = prev.filter((p: ProfileData) => p.id !== newProfile.id);
    const updated = [newProfile, ...filtered];
    localStorage.setItem("clientHistory", JSON.stringify(updated));
  };

  // Handle search
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

  // Select profile from history (menu)
  const handleSelectProfile = (id: string) => {
    const stored = localStorage.getItem("clientHistory");
    if (stored) {
      const all = JSON.parse(stored);
      const found = all.find((p: ProfileData) => p.id === id);
      if (found) setProfile(found);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <Header
        theme={theme}
        onThemeToggle={() =>
          setTheme((t) => (t === "dark" ? "light" : "dark"))
        }
        onMenuClick={() => setMenuOpen(true)} // pass click handler
      />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <SearchForm onSearch={onSearch} />
        {loading && <Spinner />}
        {error && <p className="mt-4 text-red-600">{error}</p>}
        <ProfileReport profile={profile} />
      </main>

      {/* Slide-out Menu */}
      <Menu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        activeProfileId={profile?.id || null}
        onSelectProfile={handleSelectProfile}
      />
    </div>
  );
}

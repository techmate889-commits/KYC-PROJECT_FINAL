// src/hooks/useClientHistory.ts
import { useState, useEffect } from "react";
import { ProfileData } from "../types";

export function useClientHistory() {
  const [history, setHistory] = useState<ProfileData[]>([]);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("clientHistory");
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  // Save when updated
  useEffect(() => {
    localStorage.setItem("clientHistory", JSON.stringify(history));
  }, [history]);

  // Add new profile (avoid duplicates)
  const addToHistory = (profile: ProfileData) => {
    setHistory((prev) => {
      const filtered = prev.filter((p) => p.id !== profile.id);
      return [profile, ...filtered]; // new first
    });
  };

  const removeFromHistory = (id: string) => {
    setHistory((prev) => prev.filter((p) => p.id !== id));
  };

  return { history, addToHistory, removeFromHistory };
}

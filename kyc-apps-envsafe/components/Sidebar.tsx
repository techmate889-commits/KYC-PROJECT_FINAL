/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useState } from "react";
import { LogoIcon } from "./icons";
import { ProfileData } from "../types";

interface SidebarProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onChangeTab }) => {
  const [history, setHistory] = useState<ProfileData[]>([]);

  // Load history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("clientHistory");
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  // Save history when it changes
  useEffect(() => {
    localStorage.setItem("clientHistory", JSON.stringify(history));
  }, [history]);

  const removeFromHistory = (id: string) => {
    setHistory((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-40">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-slate-200 dark:border-slate-800">
        <LogoIcon className="h-7 w-7 text-blue-500" />
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">
          KYC System
        </h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        <NavItem
          label="Client History"
          active={activeTab === "history"}
          onClick={() => onChangeTab("history")}
        />
        <NavItem
          label="Settings"
          active={activeTab === "settings"}
          onClick={() => onChangeTab("settings")}
        />
      </nav>

      {/* Client History Section */}
      <div className="flex-1 overflow-y-auto px-3 mt-4">
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
          Recent Searches
        </h3>
        {history.length > 0 ? (
          <ul className="space-y-1">
            {history.map((profile) => (
              <li key={profile.id} className="group relative">
                <button
                  onClick={() => onChangeTab("history-" + profile.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "history-" + profile.id
                      ? "bg-blue-500 text-white shadow"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="truncate">
                    {profile.instagramUsername || profile.fullName}
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromHistory(profile.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition"
                  aria-label={`Delete ${profile.instagramUsername}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400 italic">
            No searches yet
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 text-center">
        © {new Date().getFullYear()} KYC System
      </div>
    </aside>
  );
};

function NavItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-md font-medium transition-colors ${
        active
          ? "bg-blue-500 text-white shadow"
          : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
      }`}
    >
      {label}
    </button>
  );
}

export default Sidebar;

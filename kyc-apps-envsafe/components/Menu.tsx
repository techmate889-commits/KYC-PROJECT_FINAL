/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useState } from "react";
import { CloseIcon, LogoIcon } from "./icons";
import { ProfileData } from "../types";

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfileId: string | null;
  onSelectProfile: (id: string) => void;
}

const Menu: React.FC<MenuProps> = ({
  isOpen,
  onClose,
  activeProfileId,
  onSelectProfile,
}) => {
  const [history, setHistory] = useState<ProfileData[]>([]);

  // Load history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("clientHistory");
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  const removeFromHistory = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem("clientHistory", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Slide-out Menu */}
      <aside
        className={`fixed top-0 left-0 z-40 w-80 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <LogoIcon className="h-6 w-6 text-blue-500" />
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
              Menu
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
            aria-label="Close menu"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Client History */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            Client History
          </h3>
          {history.length > 0 ? (
            <ul className="space-y-1">
              {history.map((profile) => (
                <li key={profile.id} className="group relative">
                  <button
                    onClick={() => {
                      onSelectProfile(profile.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeProfileId === profile.id
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
    </>
  );
};

export default Menu;

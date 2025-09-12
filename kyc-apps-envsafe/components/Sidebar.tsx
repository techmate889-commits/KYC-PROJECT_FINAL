/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useState } from "react";
import { LogoIcon } from "./icons";
import { Moon, Sun, Monitor } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onChangeTab }) => {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

  // Load saved theme
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | "system" | null;
    if (saved) {
      setTheme(saved);
      applyTheme(saved);
    } else {
      applyTheme("light");
    }
  }, []);

  const applyTheme = (selected: "light" | "dark" | "system") => {
    if (selected === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    } else {
      document.documentElement.classList.toggle("dark", selected === "dark");
    }
  };

  const handleThemeChange = (selected: "light" | "dark" | "system") => {
    setTheme(selected);
    localStorage.setItem("theme", selected);
    applyTheme(selected);
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-40">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-slate-200 dark:border-slate-800">
        <LogoIcon className="h-7 w-7 text-blue-500" />
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">KYC System</h1>
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

      {/* Settings (only visible when tab is Settings) */}
      {activeTab === "settings" && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Theme
          </h2>
          <div className="flex gap-2">
            <ThemeButton
              icon={<Sun className="h-5 w-5" />}
              label="Light"
              selected={theme === "light"}
              onClick={() => handleThemeChange("light")}
            />
            <ThemeButton
              icon={<Moon className="h-5 w-5" />}
              label="Dark"
              selected={theme === "dark"}
              onClick={() => handleThemeChange("dark")}
            />
            <ThemeButton
              icon={<Monitor className="h-5 w-5" />}
              label="System"
              selected={theme === "system"}
              onClick={() => handleThemeChange("system")}
            />
          </div>
        </div>
      )}

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

function ThemeButton({
  icon,
  label,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-md border text-xs transition ${
        selected
          ? "border-blue-500 text-blue-600 dark:text-blue-400"
          : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export default Sidebar;

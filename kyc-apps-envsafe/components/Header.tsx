/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from "react";
import { MenuIcon, MoonIcon, SunIcon, LogoIcon } from "./icons";

interface HeaderProps {
  onMenuClick: () => void;   // Opens the slide-out menu
  onThemeToggle: () => void; // Toggles dark/light theme
  theme: "light" | "dark";
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onThemeToggle, theme }) => {
  return (
    <header className="sticky top-0 z-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {/* Menu button */}
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-white/80 hover:bg-white/20 transition-colors"
              aria-label="Open menu"
            >
              <MenuIcon className="h-6 w-6" />
            </button>

            {/* Logo + Welcome */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <LogoIcon className="h-7 w-7 text-white" />
                <span className="text-xl font-bold text-white tracking-tight">
                  Know Your Client
                </span>
              </div>
              <p className="text-sm text-white/80">
                Welcome to your Client Dashboard
              </p>
            </div>
          </div>

          {/* Right side: Theme toggle */}
          <div className="flex items-center">
            <button
              onClick={onThemeToggle}
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/20 hover:bg-white/30 text-white font-medium transition"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <>
                  <MoonIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">Dark Mode</span>
                </>
              ) : (
                <>
                  <SunIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">Light Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

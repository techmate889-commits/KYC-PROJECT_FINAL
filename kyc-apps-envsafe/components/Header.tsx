import React from 'react';
import { MenuIcon, MoonIcon, SunIcon, LogoIcon } from './icons';

interface HeaderProps {
  onMenuClick: () => void;
  onThemeToggle: () => void;
  theme: 'light' | 'dark';
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onThemeToggle, theme }) => {
  return (
    <header className="sticky top-0 z-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {/* Menu button */}
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-white/80 hover:bg-white/20 transition-colors"
              aria-label="Open client history menu"
            >
              <MenuIcon className="h-6 w-6" />
            </button>

            {/* Logo + Welcome */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <LogoIcon className="h-7 w-7 text-white" />
                <span className="text-xl font-bold text-white tracking-tight">Know Your Client</span>
              </div>
              <p className="text-sm text-white/80">Welcome to your Client Dashboard</p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center">
            <button
              onClick={onThemeToggle}
              className="p-2 rounded-full text-white/80 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <MoonIcon className="h-6 w-6" />
              ) : (
                <SunIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

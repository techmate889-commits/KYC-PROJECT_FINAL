/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { ProfileData } from '../types';
import { CloseIcon, LogoIcon } from './icons';

interface HistoryMenuProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: ProfileData[];
  activeProfileId: string | null;
  onSelectProfile: (id: string) => void;
  onDeleteProfile: (id: string) => void;
  onNewSearch: () => void;
}

const HistoryMenu: React.FC<HistoryMenuProps> = ({ 
  isOpen, 
  onClose, 
  profiles, 
  activeProfileId, 
  onSelectProfile, 
  onDeleteProfile, 
  onNewSearch 
}) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Menu */}
      <aside className={`fixed top-0 left-0 z-40 w-80 h-full bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <LogoIcon className="h-6 w-6 text-blue-500" />
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Client History</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
            aria-label="Close menu"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="p-2 space-y-1">
            <button
                onClick={onNewSearch}
                className={`w-full text-left flex items-center p-2 rounded-md font-medium transition-colors ${!activeProfileId ? 'bg-blue-500 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
            >
              + New Search
            </button>
            {profiles.length > 0 ? (
              profiles.map((profile) => (
                <div key={profile.id} className="group relative">
                  <button
                    onClick={() => onSelectProfile(profile.id)}
                    className={`w-full text-left flex items-center p-2 rounded-md font-medium transition-colors ${
                      activeProfileId === profile.id
                        ? 'bg-blue-500 text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex-1 truncate">{profile.instagramUsername}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProfile(profile.id);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Delete profile for ${profile.instagramUsername}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                <p>No client history yet.</p>
                <p>Your searched profiles will appear here.</p>
              </div>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default HistoryMenu;
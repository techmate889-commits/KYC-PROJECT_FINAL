/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react'

type Theme = 'light' | 'dark'

export default function Header({
  theme,
  onThemeToggle
}: {
  theme: Theme
  onThemeToggle: () => void
}) {
  return (
    <header className="w-full flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white">KYC Intelligence</h1>
      <button
        onClick={onThemeToggle}
        className="px-3 py-1 rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-sm"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? 'Light' : 'Dark'} mode
      </button>
    </header>
  )
}

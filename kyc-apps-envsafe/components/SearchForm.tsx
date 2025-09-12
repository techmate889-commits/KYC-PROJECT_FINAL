/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react'

export default function SearchForm({ onSearch }: { onSearch: (username: string) => void }){
  const [value, setValue] = useState('')
  return (
    <form
      onSubmit={(e)=>{ e.preventDefault(); if(value.trim()) onSearch(value.trim()) }}
      className="flex gap-2 w-full max-w-2xl mx-auto"
    >
      <input
        className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white"
        placeholder="Enter Instagram username (without @)"
        value={value}
        onChange={(e)=>setValue(e.target.value)}
      />
      <button
        className="px-4 py-2 rounded-md bg-blue-600 text-white"
        type="submit"
      >
        Generate
      </button>
    </form>
  )
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import SearchForm from './components/SearchForm'
import Spinner from './components/Spinner'
import ProfileReport from './components/ProfileReport'
import { fetchProfileData } from './services/geminiService'
import type { ProfileData } from './types'

export default function App(){
  const [theme, setTheme] = useState<'light'|'dark'>(() => (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{
    document.documentElement.classList.toggle('dark', theme === 'dark')
  },[theme])

  const onSearch = async (username: string) => {
    setLoading(true); setError(null); setProfile(null)
    try{
      const data = await fetchClientProfile(username)
      setProfile(data)
    }catch(e: any){
      setError(e?.message || 'Failed to fetch profile')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <Header theme={theme} onThemeToggle={()=> setTheme(t=> t==='dark' ? 'light':'dark')} />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <SearchForm onSearch={onSearch} />
        {loading && <Spinner />}
        {error && <p className="mt-4 text-red-600">{error}</p>}
        <ProfileReport profile={profile} />
      </main>
    </div>
  )
}

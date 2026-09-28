'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, ArrowRight } from 'lucide-react'

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)

  // Sync state if URL changes externally
  useEffect(() => {
    setQuery(searchParams.get('q') || '')
  }, [searchParams])

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (query.trim()) {
      params.set('q', query.trim())
    } else {
      params.delete('q')
    }
    router.push(`/?${params.toString()}`)
  }

  const handleClear = () => {
    setQuery('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    router.push(`/?${params.toString()}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="relative w-full max-w-md hidden md:block group">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-zinc-400 dark:text-zinc-500 group-focus-within:text-blue-500 transition-colors z-10 pointer-events-none">
        <Search size={16} strokeWidth={2.5} />
      </div>
      
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search prompts..." 
        className="w-full bg-white border border-zinc-200 shadow-sm hover:border-zinc-300 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 rounded-full pl-10 pr-16 py-2.5 text-sm font-sans text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
      />

      {query && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
          <button 
            onClick={handleClear}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors focus:outline-none"
            aria-label="Clear search"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
          
          <button 
            onClick={handleSearch}
            className="p-1.5 text-white bg-blue-500 hover:bg-blue-600 rounded-full shadow-sm transition-colors focus:outline-none"
            aria-label="Execute search"
          >
            <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  )
}

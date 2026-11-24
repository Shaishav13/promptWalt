'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, ArrowRight } from 'lucide-react'

export function SearchBar({ basePath = '/', placeholder = 'Search prompts...', className = 'flex-1 min-w-0 max-w-md' }: { basePath?: string, placeholder?: string, className?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentQ = searchParams.get('q') || ''
  const [query, setQuery] = useState(currentQ)
  const [prevCurrentQ, setPrevCurrentQ] = useState(currentQ)

  // Sync state if URL changes externally (React recommended pattern without useEffect)
  if (currentQ !== prevCurrentQ) {
    setPrevCurrentQ(currentQ)
    setQuery(currentQ)
  }

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (query.trim()) {
      params.set('q', query.trim())
    } else {
      params.delete('q')
    }
    const queryStr = params.toString()
    router.push(queryStr ? `${basePath}?${queryStr}` : basePath)
  }

  const handleClear = () => {
    setQuery('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    const queryStr = params.toString()
    router.push(queryStr ? `${basePath}?${queryStr}` : basePath)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSearch()
      }}
      role="search"
      className={`relative group ${className || 'flex-1 min-w-0 max-w-md'}`}
    >
      <div className="absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-zinc-400 dark:text-zinc-500 group-focus-within:text-blue-500 transition-colors z-10 pointer-events-none">
        <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-white border border-zinc-200 shadow-sm hover:border-zinc-300 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 rounded-full pl-8 sm:pl-10 pr-12 sm:pr-16 py-1.5 sm:py-2.5 text-xs sm:text-sm font-sans text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all [&::-webkit-search-cancel-button]:hidden"
      />

      {query && (
        <div className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 sm:gap-1 z-10">
          <button
            type="button"
            onClick={handleClear}
            className="p-1 sm:p-1.5 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors focus:outline-none"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>

          <button
            type="submit"
            className="p-1 sm:p-1.5 text-white bg-blue-500 hover:bg-blue-600 rounded-full shadow-sm transition-colors focus:outline-none"
            aria-label="Execute search"
          >
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        </div>
      )}
    </form>
  )
}

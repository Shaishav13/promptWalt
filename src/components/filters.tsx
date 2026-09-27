'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Search, X, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export function Filters({ models, tags }: { models: string[], tags: string[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentQ = searchParams.get('q') || ''
  const currentModel = searchParams.get('model') || 'all'
  const currentTag = searchParams.get('tag') || 'all'

  const [searchValue, setSearchValue] = useState(currentQ)

  const createQueryString = useCallback(
    (name: string, value: string | null | undefined) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === 'all' || !value) {
        params.delete(name)
      } else {
        params.set(name, value)
      }
      return params.toString()
    },
    [searchParams]
  )

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    router.push(`/?${createQueryString('q', searchValue)}`)
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
      <form onSubmit={handleSearch} className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          type="text"
          placeholder="Search prompts..."
          className="w-full bg-white dark:bg-zinc-950 pl-9 pr-14 h-9"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        {searchValue && (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center">
            <button 
              type="button" 
              onClick={() => {
                 setSearchValue('')
                 router.push(`/?${createQueryString('q', '')}`)
              }}
              className="h-6 w-6 flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <button 
              type="submit" 
              className="h-6 w-6 flex items-center justify-center text-zinc-400 hover:text-primary transition-colors rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </form>
      
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Select
          value={currentModel}
          onValueChange={(val) => router.push(`/?${createQueryString('model', val)}`)}
        >
          <SelectTrigger className="w-full sm:w-[150px] h-9 bg-white dark:bg-zinc-950">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <span className="text-xs font-medium uppercase tracking-wider">Model:</span>
              <span className="text-zinc-900 dark:text-zinc-100 truncate">
                {currentModel === 'all' ? 'All' : currentModel}
              </span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Models</SelectItem>
            {models.map(m => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentTag}
          onValueChange={(val) => router.push(`/?${createQueryString('tag', val)}`)}
        >
          <SelectTrigger className="w-full sm:w-[150px] h-9 bg-white dark:bg-zinc-950">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <span className="text-xs font-medium uppercase tracking-wider">Tag:</span>
              <span className="text-zinc-900 dark:text-zinc-100 truncate">
                {currentTag === 'all' ? 'All' : currentTag}
              </span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {tags.map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(currentModel !== 'all' || currentTag !== 'all' || currentQ !== '') && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 px-2 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            onClick={() => {
              setSearchValue('')
              router.push('/')
            }}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}

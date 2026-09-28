'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Grid, List, ArrowDownUp, Filter, ChevronDown, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

export function Toolbar({ promptCount, models, tags }: { promptCount: number, models: string[], tags: string[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentView = searchParams.get('view') || 'grid'
  const currentSort = searchParams.get('sort') || 'newest'
  const currentModel = searchParams.get('model') || 'all'
  const currentTag = searchParams.get('tag') || 'all'

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all' || value === 'grid' && key === 'view' || value === 'newest' && key === 'sort') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border border-zinc-200 text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:bg-white/5 dark:border-white/10 dark:text-zinc-300 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50">
            View <ChevronDown className="w-4 h-4 opacity-50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => updateParam('view', 'grid')}>
              Grid View {currentView === 'grid' && <Check className="w-4 h-4 ml-auto" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateParam('view', 'list')}>
              List View {currentView === 'list' && <Check className="w-4 h-4 ml-auto" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex items-center p-0.5 rounded-md bg-zinc-100 border border-zinc-200 dark:bg-white/5 dark:border-white/10">
          <button 
            onClick={() => updateParam('view', 'grid')}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${currentView === 'grid' ? 'bg-white dark:bg-white/10 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'}`}
          >
            <Grid className="w-3.5 h-3.5" /> Grid
          </button>
          <button 
            onClick={() => updateParam('view', 'list')}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${currentView === 'list' ? 'bg-white dark:bg-white/10 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'}`}
          >
            <List className="w-3.5 h-3.5" /> List
          </button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-zinc-200 text-xs font-medium text-zinc-700 hover:text-zinc-900 dark:bg-white/5 dark:border-white/10 dark:text-zinc-300 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50">
            <ArrowDownUp className="w-3.5 h-3.5" /> Sort
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => updateParam('sort', 'newest')}>
              Newest first {currentSort === 'newest' && <Check className="w-4 h-4 ml-auto" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateParam('sort', 'oldest')}>
              Oldest first {currentSort === 'oldest' && <Check className="w-4 h-4 ml-auto" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateParam('sort', 'az')}>
              A to Z {currentSort === 'az' && <Check className="w-4 h-4 ml-auto" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-zinc-200 text-xs font-medium text-zinc-700 hover:text-zinc-900 dark:bg-white/5 dark:border-white/10 dark:text-zinc-300 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50">
            <Filter className="w-3.5 h-3.5" /> Filter
            {(currentModel !== 'all' || currentTag !== 'all') && (
              <span className="w-2 h-2 rounded-full bg-primary ml-1"></span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 max-h-[300px] overflow-y-auto">
            <div className="px-2 py-1.5 text-sm font-semibold text-zinc-900 dark:text-white">Models</div>
            <DropdownMenuItem onClick={() => updateParam('model', 'all')}>
              All Models {currentModel === 'all' && <Check className="w-4 h-4 ml-auto" />}
            </DropdownMenuItem>
            {models.map(m => (
              <DropdownMenuItem key={m} onClick={() => updateParam('model', m)}>
                {m} {currentModel === m && <Check className="w-4 h-4 ml-auto" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-sm font-semibold text-zinc-900 dark:text-white mt-1">Tags</div>
            <DropdownMenuItem onClick={() => updateParam('tag', 'all')}>
              All Tags {currentTag === 'all' && <Check className="w-4 h-4 ml-auto" />}
            </DropdownMenuItem>
            {tags.map(t => (
              <DropdownMenuItem key={t} onClick={() => updateParam('tag', t)}>
                {t} {currentTag === t && <Check className="w-4 h-4 ml-auto" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="text-xs text-zinc-500 font-medium ml-2 border-l border-zinc-200 dark:border-white/10 pl-4 hidden md:block">
          {promptCount} Prompts
        </div>
      </div>
    </div>
  )
}

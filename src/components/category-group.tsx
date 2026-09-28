'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Folder, ChevronDown, ChevronRight, Hash, Star } from 'lucide-react'
import { NewCategoryDialog } from '@/components/new-category-dialog'

interface Category {
  id: string
  name: string
  color: string | null
}

interface CategoryGroupProps {
  categories: Category[] | null
  activeCategoryId?: string
  isFavoritesView?: boolean
}

export function CategoryGroup({ categories, activeCategoryId, isFavoritesView }: CategoryGroupProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="space-y-[2px] pt-2">
      <div className="flex items-center justify-between px-3 h-10 group">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="flex flex-1 items-center gap-3 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors focus:outline-none"
        >
          <Folder className="h-[18px] w-[18px]" />
          <span>Collections</span>
        </button>
        <div className="flex items-center gap-0.5 opacity-50 group-hover:opacity-100 transition-opacity">
          <NewCategoryDialog />
          <button onClick={() => setIsOpen(!isOpen)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-500 transition-colors focus:outline-none">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      {isOpen && (
        <div className="space-y-[2px] pb-1">
          <Link
            href="/?favorites"
            className={`flex items-center gap-3 rounded-md px-3 h-9 text-sm font-medium transition-colors ml-2.5 ${isFavoritesView ? 'bg-white shadow-sm text-zinc-900 dark:bg-white/10 dark:text-white dark:shadow-none' : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/60 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5'}`}
          >
            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
            Favorites
          </Link>
          {categories?.map((cat) => (
            <Link
              key={cat.id}
              href={`/?category=${cat.id}`}
              className={`flex items-center gap-3 rounded-md px-3 h-9 text-sm font-medium transition-colors ml-4 ${activeCategoryId === cat.id ? 'bg-white shadow-sm text-zinc-900 dark:bg-white/10 dark:text-white dark:shadow-none' : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/60 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5'}`}
            >
              <div className="h-2 w-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: cat.color || '#3b82f6', boxShadow: `0 0 10px ${cat.color || '#3b82f6'}` }} />
              {cat.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

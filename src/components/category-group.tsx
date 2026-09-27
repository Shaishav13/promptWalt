'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Hexagon, ChevronDown, ChevronRight } from 'lucide-react'
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
    <div className="space-y-1">
      <div className="pt-4 pb-2 px-2 flex items-center justify-between">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 uppercase px-2 transition-colors focus:outline-none"
        >
          {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          Categories
        </button>
        <div className="px-2">
          <NewCategoryDialog />
        </div>
      </div>
      
      {isOpen && (
        <div className="space-y-1">
          <Link 
            href="/"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${!activeCategoryId && !isFavoritesView ? 'bg-primary/10 text-primary' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            <Hexagon className="h-4 w-4" />
            All Prompts
          </Link>
          {categories?.map((cat) => (
            <Link
              key={cat.id}
              href={`/?category=${cat.id}`}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${activeCategoryId === cat.id ? 'bg-primary/10 text-primary' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color || '#3b82f6' }} />
              {cat.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

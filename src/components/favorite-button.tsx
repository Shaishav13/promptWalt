'use client'

import { Star } from 'lucide-react'
import { useTransition, useState } from 'react'
import { toggleFavorite } from '@/app/actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function FavoriteButton({ 
  promptId, 
  initialIsFavorite 
}: { 
  promptId: string
  initialIsFavorite: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent opening the dialog
    e.stopPropagation()
    
    const newValue = !isFavorite
    setIsFavorite(newValue)
    
    startTransition(async () => {
      const result = await toggleFavorite(promptId, newValue)
      if (result.error) {
        setIsFavorite(!newValue) // Revert on error
        toast.error('Failed to update favorite status')
      } else {
        toast.success(newValue ? 'Added to favorites' : 'Removed from favorites')
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
        isFavorite ? "text-yellow-500 hover:text-yellow-600" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
      )}
    >
      <Star className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
    </button>
  )
}

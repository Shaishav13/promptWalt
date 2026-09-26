import { createClient } from '@/utils/supabase/server'
import { logout } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { LogOut, User, Hexagon } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NewCategoryDialog } from '@/components/new-category-dialog'
import { ImportDataDialog } from '@/components/import-data-dialog'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'
import Image from 'next/image'

export async function Sidebar({ activeCategoryId, isFavoritesView }: { activeCategoryId?: string, isFavoritesView?: boolean }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  return (
    <aside className="hidden w-64 flex-col border-r bg-white dark:bg-zinc-900 md:flex flex-shrink-0">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Image src="/logo.png" alt="PromptWalt" width={24} height={24} className="rounded-sm" />
        <span className="text-lg font-bold">PromptWalt</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-2">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start">
              All Prompts
            </Button>
          </Link>
          <Link href="/?favorites=true">
            <Button variant="ghost" className={`w-full justify-start ${isFavoritesView ? 'bg-primary/10 text-primary' : ''}`}>
              Favorites
            </Button>
          </Link>
          <Link href="/profile">
            <Button variant="ghost" className="w-full justify-start mt-1">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
          </Link>
          <ImportDataDialog />
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-zinc-500 uppercase flex items-center justify-between">
            Categories
            <NewCategoryDialog />
          </div>
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
      </div>
      <div className="border-t p-4 flex items-center justify-between shrink-0">
        <form action={logout} className="flex-1">
          <Button variant="ghost" type="submit" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50">
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </form>
        <ThemeToggle />
      </div>
    </aside>
  )
}

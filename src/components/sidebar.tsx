import { createClient } from '@/utils/supabase/server'
import { logout } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { LogOut, Home, SquarePen, Box, BarChart2, Settings } from 'lucide-react'
import { CategoryGroup } from '@/components/category-group'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'
import Image from 'next/image'

export async function Sidebar({ activeCategoryId, isFavoritesView, activePath = '/' }: { activeCategoryId?: string, isFavoritesView?: boolean, activePath?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  return (
    <aside className="hidden w-[240px] lg:w-[260px] flex-col bg-transparent text-zinc-600 dark:text-zinc-400 md:flex flex-shrink-0 z-10">
      <div className="flex h-16 items-center gap-3 px-6 shrink-0 pt-2">
        <Image src="/logo.png" alt="PromptWalt" width={28} height={28} className="rounded-md" />
        <span className="text-lg font-bold font-sans text-zinc-900 dark:text-white tracking-tight">PromptWalt</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3 font-sans">
          <Link href="/">
            <Button variant="ghost" className={`w-full justify-start text-zinc-600 hover:text-zinc-900 hover:bg-white/60 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5 h-10 px-3 rounded-lg`}>
              <Home className="mr-3 h-[18px] w-[18px]" />
              <span className="text-sm font-medium">Dashboard</span>
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className={`w-full justify-start h-10 px-3 rounded-lg ${activePath === '/' && !isFavoritesView && !activeCategoryId ? 'bg-white shadow-sm text-zinc-900 dark:bg-[#1a1b23] dark:text-indigo-50 dark:shadow-none' : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/60 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5'}`}>
              <SquarePen className={`mr-3 h-[18px] w-[18px] ${activePath === '/' && !isFavoritesView && !activeCategoryId ? 'dark:text-indigo-400' : ''}`} />
              <span className="text-sm font-medium">Prompts</span>
            </Button>
          </Link>
          
          <CategoryGroup categories={categories} activeCategoryId={activeCategoryId} isFavoritesView={isFavoritesView} />

          <Button variant="ghost" className="w-full justify-start text-zinc-600 hover:text-zinc-900 hover:bg-white/60 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5 h-10 px-3 rounded-lg mt-2">
            <Box className="mr-3 h-[18px] w-[18px]" />
            <span className="text-sm font-medium">Models</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-zinc-600 hover:text-zinc-900 hover:bg-white/60 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5 h-10 px-3 rounded-lg">
            <BarChart2 className="mr-3 h-[18px] w-[18px]" />
            <span className="text-sm font-medium">Analytics</span>
          </Button>
          <Link href="/settings">
            <Button variant="ghost" className={`w-full justify-start h-10 px-3 rounded-lg ${activePath === '/settings' ? 'bg-white shadow-sm text-zinc-900 dark:bg-[#1a1b23] dark:text-indigo-50 dark:shadow-none' : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/60 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5'}`}>
              <Settings className={`mr-3 h-[18px] w-[18px] ${activePath === '/settings' ? 'dark:text-indigo-400' : ''}`} />
              <span className="text-sm font-medium">Settings</span>
            </Button>
          </Link>
        </div>
      </div>
      <div className="p-4 shrink-0 mt-auto flex items-center justify-between">
        <form action={logout} className="flex-1">
          <Button variant="ghost" type="submit" className="w-full justify-start text-zinc-600 hover:text-zinc-900 hover:bg-white/60 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5 h-10 px-3">
            <LogOut className="mr-3 h-[18px] w-[18px]" />
            <span className="text-sm font-medium">Log Out</span>
          </Button>
        </form>
        <ThemeToggle />
      </div>
    </aside>
  )
}

import { createClient } from '@/utils/supabase/server'
import { logout } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { LogOut, Home, SquarePen, Box, BarChart2, Menu, Settings } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ThemeToggle } from '@/components/theme-toggle'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { CategoryGroup } from '@/components/category-group'
import Link from 'next/link'
import Image from 'next/image'

export async function MobileSidebar({ activeCategoryId, isFavoritesView }: { activeCategoryId?: string, isFavoritesView?: boolean }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  return (
    <Sheet>
      <SheetTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 md:hidden">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-[260px] p-0 flex flex-col bg-slate-50 dark:bg-[#090a0f] border-r-0">
        <div className="flex h-16 items-center gap-3 px-6 shrink-0 pt-2 border-b border-zinc-200 dark:border-white/5">
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
              <Button variant="ghost" className={`w-full justify-start h-10 px-3 rounded-lg ${!isFavoritesView && !activeCategoryId ? 'bg-white shadow-sm text-zinc-900 dark:bg-[#1a1b23] dark:text-indigo-50 dark:shadow-none' : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/60 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5'}`}>
                <SquarePen className={`mr-3 h-[18px] w-[18px] ${!isFavoritesView && !activeCategoryId ? 'dark:text-indigo-400' : ''}`} />
                <span className="text-sm font-medium">Prompts</span>
              </Button>
            </Link>
            
            <CategoryGroup categories={categories} activeCategoryId={activeCategoryId} isFavoritesView={isFavoritesView} />
            
            <Link href="/models">
              <Button variant="ghost" className="w-full justify-start text-zinc-600 hover:text-zinc-900 hover:bg-white/60 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5 h-10 px-3 rounded-lg mt-2">
                <Box className="mr-3 h-[18px] w-[18px]" />
                <span className="text-sm font-medium">Models</span>
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="ghost" className="w-full justify-start text-zinc-600 hover:text-zinc-900 hover:bg-white/60 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5 h-10 px-3 rounded-lg">
                <BarChart2 className="mr-3 h-[18px] w-[18px]" />
                <span className="text-sm font-medium">Analytics</span>
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" className="w-full justify-start h-10 px-3 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-white/60 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5">
                <Settings className="mr-3 h-[18px] w-[18px]" />
                <span className="text-sm font-medium">Settings</span>
              </Button>
            </Link>
          </div>
        </div>
        <div className="p-4 shrink-0 mt-auto flex items-center justify-between border-t border-zinc-200 dark:border-white/5">
          <form action={logout} className="flex-1">
            <Button variant="ghost" type="submit" className="w-full justify-start text-zinc-600 hover:text-zinc-900 hover:bg-white/60 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5 h-10 px-3">
              <LogOut className="mr-3 h-[18px] w-[18px]" />
              <span className="text-sm font-medium">Log Out</span>
            </Button>
          </form>
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  )
}

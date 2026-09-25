import { createClient } from '@/utils/supabase/server'
import { logout } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { LogOut, User, Hexagon, Menu } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NewCategoryDialog } from '@/components/new-category-dialog'
import { ThemeToggle } from '@/components/theme-toggle'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import Link from 'next/link'

export async function MobileSidebar({ activeCategoryId }: { activeCategoryId?: string }) {
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
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-14 items-center border-b px-4">
          <span className="text-lg font-bold">PromptWalt</span>
        </div>
        <ScrollArea className="flex-1 py-4 h-[calc(100vh-120px)]">
          <div className="space-y-1 px-2">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start">
                All Prompts
              </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start">
              Favorites
            </Button>
            <Link href="/profile">
              <Button variant="ghost" className="w-full justify-start mt-1">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </Link>
            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-zinc-500 uppercase flex items-center justify-between">
              Categories
              <NewCategoryDialog />
            </div>
            <Link 
              href="/"
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${!activeCategoryId ? 'bg-primary/10 text-primary' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
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
        </ScrollArea>
        <div className="border-t p-4 flex items-center justify-between mt-auto">
          <form action={logout} className="flex-1">
            <Button variant="ghost" type="submit" className="w-full justify-start text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </form>
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  )
}

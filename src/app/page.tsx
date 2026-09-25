import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Menu, LogOut, Hexagon, User } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NewPromptDialog } from '@/components/new-prompt-dialog'
import { PromptDetailDialog } from '@/components/prompt-detail-dialog'
import { NewCategoryDialog } from '@/components/new-category-dialog'
import { ThemeToggle } from '@/components/theme-toggle'
import { Filters } from '@/components/filters'
import { Sidebar } from '@/components/sidebar'
import { MobileSidebar } from '@/components/mobile-sidebar'
import Link from 'next/link'

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string, q?: string, model?: string, tag?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Resolve search parameters for Next.js 15+ (App Router standard)
  const resolvedParams = await searchParams
  const categoryId = resolvedParams?.category
  const searchQuery = resolvedParams?.q
  const modelFilter = resolvedParams?.model
  const tagFilter = resolvedParams?.tag

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  // Fetch all user prompts to extract unique models and tags
  const { data: allUserPrompts } = await supabase
    .from('prompts')
    .select('model_used, tags')
    .eq('user_id', user.id)

  const uniqueModels = new Set<string>()
  const uniqueTags = new Set<string>()

  allUserPrompts?.forEach(p => {
    if (p.model_used) uniqueModels.add(p.model_used)
    if (p.tags && Array.isArray(p.tags)) {
      p.tags.forEach((t: string) => uniqueTags.add(t))
    }
  })

  const allModels = Array.from(uniqueModels).sort()
  const allTags = Array.from(uniqueTags).sort()

  // Fetch filtered prompts
  let query = supabase
    .from('prompts')
    .select('*')
    .eq('user_id', user.id)

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  if (modelFilter) {
    query = query.eq('model_used', modelFilter)
  }

  if (tagFilter) {
    query = query.contains('tags', [tagFilter])
  }

  if (searchQuery) {
    query = query.ilike('prompt_text', `%${searchQuery}%`)
  }

  const { data: prompts } = await query.order('created_at', { ascending: false })

  const promptsWithUrls = await Promise.all((prompts || []).map(async (prompt) => {
    let signedUrls: string[] = []
    if (prompt.demo_image_urls && prompt.demo_image_urls.length > 0) {
      for (const url of prompt.demo_image_urls) {
        const { data } = await supabase.storage.from('prompt-images').createSignedUrl(url, 3600)
        if (data?.signedUrl) signedUrls.push(data.signedUrl)
      }
    }
    return { ...prompt, signedUrls }
  }))

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <Sidebar activeCategoryId={categoryId} />

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-14 items-center gap-4 border-b bg-white px-4 dark:bg-zinc-900 lg:px-6">
          <MobileSidebar activeCategoryId={categoryId} />

          <div className="flex flex-1 items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <div className="flex-1 w-full max-w-2xl mx-auto">
              <Filters models={allModels} tags={allTags} />
            </div>
            <NewPromptDialog categories={categories || []} />
          </div>
        </header>

        {/* Grid View */}
        <ScrollArea className="flex-1 p-4 lg:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {promptsWithUrls.length === 0 ? (
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <p className="text-sm text-zinc-500">No prompts yet.</p>
              </div>
            ) : (
              promptsWithUrls.map((prompt) => (
                <PromptDetailDialog key={prompt.id} prompt={prompt} categories={categories || []}>
                  {prompt.signedUrls && prompt.signedUrls.length > 0 ? (
                    <div className="aspect-[4/5] bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={prompt.signedUrls[0]} alt={prompt.title || 'Prompt image'} className="h-full w-full object-cover transition-transform hover:scale-105 duration-300" />
                      {prompt.signedUrls.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                          1/2
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-[4/5] bg-zinc-100 flex items-center justify-center p-4 dark:bg-zinc-800 text-xs text-zinc-500 overflow-hidden text-ellipsis">
                      {prompt.prompt_text}
                    </div>
                  )}
                  <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <h3 className="font-medium text-sm truncate">{prompt.title || 'Untitled Prompt'}</h3>
                    {prompt.model_used && <p className="text-xs text-zinc-500 mt-1">{prompt.model_used}</p>}
                  </div>
                </PromptDetailDialog>
              ))
            )}
          </div>
        </ScrollArea>
      </main>
    </div>
  )
}

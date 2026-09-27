import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Menu, LogOut, Hexagon, User } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

import { NewPromptDialog } from '@/components/new-prompt-dialog'
import { PromptDetailDialog } from '@/components/prompt-detail-dialog'
import { NewCategoryDialog } from '@/components/new-category-dialog'
import { ThemeToggle } from '@/components/theme-toggle'
import { Filters } from '@/components/filters'
import { Sidebar } from '@/components/sidebar'
import { MobileSidebar } from '@/components/mobile-sidebar'
import { FavoriteButton } from '@/components/favorite-button'
import { LandingPage } from '@/components/landing-page'
import { EmptyState } from '@/components/empty-state'
import Link from 'next/link'

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string, q?: string, model?: string, tag?: string, favorites?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <LandingPage />
  }

  // Resolve search parameters for Next.js 15+ (App Router standard)
  const resolvedParams = await searchParams
  const categoryId = resolvedParams?.category
  const searchQuery = resolvedParams?.q
  const modelFilter = resolvedParams?.model
  const tagFilter = resolvedParams?.tag
  const favoritesFilter = resolvedParams?.favorites === 'true'

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

  if (favoritesFilter) {
    query = query.eq('is_favorite', true)
  }

  if (searchQuery) {
    // Full-text search across both title and the prompt body
    query = query.or(`title.ilike.%${searchQuery}%,prompt_text.ilike.%${searchQuery}%`)
  }

  const { data: prompts } = await query.order('created_at', { ascending: false })

  const promptsWithUrls = await Promise.all((prompts || []).map(async (prompt) => {
    let signedUrls: string[] = []
    if (prompt.demo_image_urls && prompt.demo_image_urls.length > 0) {
      for (const url of prompt.demo_image_urls) {
        const { data } = supabase.storage.from('prompt-images').getPublicUrl(url)
        if (data?.publicUrl) signedUrls.push(data.publicUrl)
      }
    }
    return { ...prompt, signedUrls }
  }))

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <Sidebar activeCategoryId={categoryId} isFavoritesView={favoritesFilter} />

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex flex-col gap-4 border-b bg-white p-4 dark:bg-zinc-900 md:h-14 md:flex-row md:items-center md:p-0 md:px-4 lg:px-6 shrink-0">
          <div className="flex items-center justify-between w-full md:w-auto">
            <MobileSidebar activeCategoryId={categoryId} isFavoritesView={favoritesFilter} />
            <div className="md:hidden flex items-center gap-2">
              <NewPromptDialog categories={categories || []} />
              <Link href="/profile">
                <Button variant="ghost" size="icon" className="rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="w-full md:flex-1">
            <Filters models={allModels} tags={allTags} />
          </div>
          <div className="hidden md:flex md:items-center md:gap-3">
            <NewPromptDialog categories={categories || []} />
            <Link href="/profile">
              <Button variant="ghost" size="icon" className="rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">
                <User className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Grid View */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {allUserPrompts?.length === 0 ? (
            <EmptyState categories={categories || []} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {promptsWithUrls.length === 0 ? (
                <div className="col-span-full flex h-64 items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <p className="text-sm text-zinc-500">No matching prompts found.</p>
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
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium text-sm truncate flex items-center gap-2">
                        {(() => {
                          const cat = categories?.find(c => c.id === prompt.category_id)
                          if (!cat) return null
                          return (
                            <span 
                              className="w-2 h-2 rounded-full shrink-0" 
                              style={{ backgroundColor: cat.color || '#3b82f6' }}
                              title={cat.name}
                            />
                          )
                        })()}
                        {prompt.title || 'Untitled Prompt'}
                      </h3>
                      <FavoriteButton promptId={prompt.id} initialIsFavorite={prompt.is_favorite || false} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1 min-h-[20px]">
                      {prompt.model_used && <p className="text-xs text-zinc-500 truncate max-w-[60%]">{prompt.model_used}</p>}
                      {(() => {
                        const cat = categories?.find(c => c.id === prompt.category_id)
                        if (!cat) return null
                        return (
                          <p className="text-[10px] px-1.5 py-0.5 rounded-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium ml-auto truncate max-w-[40%]">
                            {cat.name}
                          </p>
                        )
                      })()}
                    </div>
                  </div>
                </PromptDetailDialog>
              ))
            )}
          </div>
          )}
        </div>
      </main>
    </div>
  )
}

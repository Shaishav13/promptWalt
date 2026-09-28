import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Menu, LogOut, Hexagon, User, ChevronDown, Grid, List, ArrowDownUp, Filter, Star } from 'lucide-react'
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
import { SearchBar } from '@/components/search-bar'
import { Toolbar } from '@/components/toolbar'
import Link from 'next/link'

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string, q?: string, model?: string, tag?: string, favorites?: string, view?: string, sort?: string }> }) {
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
  const favoritesFilter = resolvedParams?.favorites !== undefined
  const viewMode = resolvedParams?.view || 'grid'
  const sortMode = resolvedParams?.sort || 'newest'

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

  let prompts;
  if (sortMode === 'oldest') {
    const { data } = await query.order('created_at', { ascending: true })
    prompts = data
  } else if (sortMode === 'az') {
    const { data } = await query.order('title', { ascending: true })
    prompts = data
  } else {
    // newest
    const { data } = await query.order('created_at', { ascending: false })
    prompts = data
  }

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
    <div className="flex h-screen overflow-hidden text-zinc-900 font-sans bg-slate-100 dark:text-zinc-100 dark:bg-[#090a0f] relative">
      {/* Decorative ambient glow (Blue/Green professional combo) */}
      <div className="absolute top-0 left-0 w-[60%] h-[60%] rounded-full bg-blue-400/20 dark:bg-blue-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-400/20 dark:bg-teal-500/10 blur-[100px] pointer-events-none" />
      
      <div className="z-10 flex h-full w-full">
        <Sidebar activeCategoryId={categoryId} isFavoritesView={favoritesFilter} />

        {/* Main Area */}
        <div className="flex flex-1 flex-col overflow-hidden relative">
          {/* Header Bar */}
          <header className="flex flex-col gap-4 p-4 md:h-20 md:flex-row md:items-center justify-between shrink-0 bg-transparent px-6">
            <div className="flex items-center gap-4 w-full md:w-auto flex-1">
              <MobileSidebar activeCategoryId={categoryId} isFavoritesView={favoritesFilter} />
              
              <SearchBar />
            </div>

          <div className="flex items-center gap-4">
            <Link href="/profile" className="hidden md:flex items-center gap-3 bg-zinc-100 dark:bg-white/5 rounded-full p-1 pr-3 border border-zinc-200 dark:border-white/10 cursor-pointer hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors">
              <div className="w-6 h-6 rounded-full bg-indigo-500 overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <span className="text-xs font-medium font-sans text-zinc-700 dark:text-zinc-300 truncate max-w-[120px]">
                {user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
              </span>
            </Link>
            
            <button className="hidden md:flex relative p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white dark:border-[#0e0f11]"></div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </button>
          </div>
        </header>

        {/* Opaque App Content Shell */}
        <div className="flex-1 bg-white dark:bg-[#0e0f11] rounded-tl-3xl border-t border-l border-white dark:border-white/5 flex flex-col overflow-hidden shadow-2xl shadow-slate-200 dark:shadow-2xl">
          {/* Header Section */}
        <div className="px-6 py-8 pb-4 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-sans tracking-tight text-zinc-900 dark:text-white mb-1">
                {favoritesFilter ? 'Favorites' : 'My Prompts'}
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {favoritesFilter ? 'Your starred prompts' : 'Prompt Management Dashboard'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <NewPromptDialog categories={categories || []} />
            </div>
          </div>
          
          <Toolbar promptCount={promptsWithUrls.length || 0} models={allModels} tags={allTags} />
        </div>

        {/* Dynamic View (Grid or List) */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-0">
          {allUserPrompts?.length === 0 ? (
            <EmptyState categories={categories || []} />
          ) : (
            <div className={viewMode === 'list' ? "flex flex-col gap-4" : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}>
              {promptsWithUrls.length === 0 ? (
                <div className="col-span-full flex flex-col h-64 items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white dark:border-white/10 dark:bg-[#1a1b1e]">
                  {favoritesFilter ? (
                    <>
                      <Star className="h-8 w-8 text-black dark:text-zinc-500 mb-3" />
                      <p className="text-sm text-zinc-500 font-medium">You haven't favorited any prompts yet.</p>
                      <p className="text-xs text-zinc-400 mt-1">Click the star icon on a prompt to add it here.</p>
                    </>
                  ) : (
                    <p className="text-sm text-zinc-500">No matching prompts found.</p>
                  )}
                </div>
              ) : (
              promptsWithUrls.map((prompt) => (
                <PromptDetailDialog key={prompt.id} prompt={prompt} categories={categories || []}>
                  <div className={`bg-white border border-zinc-200 dark:bg-[#1a1b1e] dark:border-white/5 rounded-xl flex hover:border-zinc-300 dark:hover:border-white/20 transition-all group overflow-hidden h-full text-left shadow-sm dark:shadow-none ${viewMode === 'list' ? 'flex-row items-stretch' : 'flex-col'}`}>
                    <div className={`${viewMode === 'list' ? 'w-48 sm:w-64 p-3 pr-0 shrink-0 flex flex-col' : 'p-3 pb-0'}`}>
                      {prompt.signedUrls && prompt.signedUrls.length > 0 ? (
                        <div className={`${viewMode === 'list' ? 'h-full w-full' : 'aspect-[4/3]'} rounded-lg overflow-hidden relative`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={prompt.signedUrls[0]} alt={prompt.title || 'Prompt image'} className="h-full w-full object-cover transition-transform hover:scale-105 duration-300 absolute inset-0" />
                          {prompt.signedUrls.length > 1 && (
                            <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded z-10">
                              1/2
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={`${viewMode === 'list' ? 'h-full w-full' : 'aspect-[4/3]'} rounded-lg bg-zinc-50 border border-zinc-100 dark:bg-[#0e0f11] dark:border-white/5 p-4 flex flex-col gap-2 font-mono text-xs overflow-hidden relative`}>
                          <div className="text-zinc-500 relative z-10">Code Block</div>
                          <div className="text-zinc-600 dark:text-zinc-400 mt-2 whitespace-pre-wrap line-clamp-5 relative z-10">
                            {prompt.prompt_text}
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 dark:from-[#0e0f11] via-transparent to-transparent pointer-events-none z-20"></div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col min-w-0">
                      <h3 className="font-semibold text-[15px] text-zinc-900 dark:text-white leading-tight mb-2 truncate">
                        {prompt.title || 'Untitled Prompt'}
                      </h3>
                      
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {(() => {
                          const cat = categories?.find(c => c.id === prompt.category_id)
                          if (cat) {
                            return (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-white/5 dark:text-zinc-300 dark:border-white/5 font-medium">
                                #{cat.name}
                              </span>
                            )
                          }
                        })()}
                        {prompt.model_used && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-500 border border-zinc-200 dark:bg-white/5 dark:text-zinc-400 dark:border-white/5 font-medium">
                            {prompt.model_used}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-4 flex-1">
                        Prompt: {prompt.prompt_text}
                      </p>
                      
                      <div className="mt-auto pt-3 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between">
                        <div className="text-[10px] text-zinc-500">
                          Date created:<br/>
                          <span className="text-zinc-700 dark:text-zinc-400">{new Date(prompt.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                          <FavoriteButton promptId={prompt.id} initialIsFavorite={prompt.is_favorite || false} />
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between text-zinc-400 dark:text-zinc-500">
                        <button className="p-1 hover:text-zinc-900 dark:hover:text-white transition-colors" title="More">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                        </button>
                        <div className="flex items-center gap-1">
                          <button className="p-1 hover:text-zinc-900 dark:hover:text-white transition-colors" title="Edit">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                          </button>
                          <button className="p-1 hover:text-zinc-900 dark:hover:text-white transition-colors" title="Delete">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                          <button className="p-1 hover:text-zinc-900 dark:hover:text-white transition-colors" title="Copy">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </PromptDetailDialog>
              ))
            )}
          </div>
          )}
        </div>
        </div>
      </div>
    </div>
  </div>
  )
}

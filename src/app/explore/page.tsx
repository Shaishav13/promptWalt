import { createClient } from '@/utils/supabase/server'
import { Sidebar } from '@/components/sidebar'
import { MobileSidebar } from '@/components/mobile-sidebar'
import { SearchBar } from '@/components/search-bar'
import { Toolbar } from '@/components/toolbar'
import { ThemeToggle } from '@/components/theme-toggle'
import { ExploreDetailDialog } from '@/components/explore-detail-dialog'
import { ExploreCardActions } from '@/components/explore-card-actions'
import { NewPromptDialog } from '@/components/new-prompt-dialog'
import { Button } from '@/components/ui/button'
import { Compass, Sparkles, Globe, LogIn, ArrowRight, Search } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function ExplorePage({
  searchParams
}: {
  searchParams: Promise<{ q?: string, model?: string, tag?: string, view?: string, sort?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const resolvedParams = await searchParams
  const searchQuery = resolvedParams?.q
  const modelFilter = resolvedParams?.model
  const tagFilter = resolvedParams?.tag
  const viewMode = resolvedParams?.view || 'grid'
  const sortMode = resolvedParams?.sort || 'newest'

  // Query only public prompts
  let query = supabase
    .from('prompts')
    .select('*')
    .eq('visibility', 'public')

  if (modelFilter && modelFilter !== 'all') {
    query = query.eq('model_used', modelFilter)
  }

  if (tagFilter && tagFilter !== 'all') {
    query = query.contains('tags', [tagFilter])
  }

  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,prompt_text.ilike.%${searchQuery}%`)
  }

  if (sortMode === 'oldest') {
    query = query.order('created_at', { ascending: true })
  } else if (sortMode === 'popular') {
    query = query.order('usage_count', { ascending: false })
  } else if (sortMode === 'az') {
    query = query.order('title', { ascending: true })
  } else {
    // newest default
    query = query.order('created_at', { ascending: false })
  }

  const [promptsRes, allPublicPromptsRes, categoriesRes] = await Promise.all([
    query,
    supabase.from('prompts').select('model_used, tags').eq('visibility', 'public'),
    user ? supabase.from('categories').select('*').eq('user_id', user.id).order('name') : Promise.resolve({ data: [] })
  ])

  const prompts = promptsRes.data || []
  const allPublicPrompts = allPublicPromptsRes.data || []
  const categories = categoriesRes.data || []

  // Extract unique models and tags across public community prompts
  const uniqueModels = new Set<string>()
  const uniqueTags = new Set<string>()

  allPublicPrompts.forEach(p => {
    if (p.model_used) uniqueModels.add(p.model_used)
    if (p.tags && Array.isArray(p.tags)) {
      p.tags.forEach((t: string) => uniqueTags.add(t))
    }
  })

  const allModels = Array.from(uniqueModels).sort()
  const allTags = Array.from(uniqueTags).sort()

  // Generate public image URLs
  const promptsWithUrls = prompts.map(prompt => {
    const signedUrls: string[] = []
    if (prompt.demo_image_urls && prompt.demo_image_urls.length > 0) {
      for (const url of prompt.demo_image_urls) {
        const { data } = supabase.storage.from('prompt-images').getPublicUrl(url)
        if (data?.publicUrl) signedUrls.push(data.publicUrl)
      }
    }
    return { ...prompt, signedUrls }
  })

  return (
    <div className="flex h-screen overflow-hidden text-zinc-900 font-sans bg-slate-100 dark:text-zinc-100 dark:bg-[#090a0f] relative">
      {/* Decorative ambient glow matching PromptWalt theme */}
      <div className="absolute top-0 left-0 w-[60%] h-[60%] rounded-full bg-blue-500/15 dark:bg-blue-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-400/20 dark:bg-teal-500/10 blur-[100px] pointer-events-none" />

      <div className="z-10 flex h-full w-full">
        {/* If logged in, show authenticated sidebar */}
        {user ? (
          <Sidebar activePath="/explore" />
        ) : (
          <aside className="hidden w-[240px] lg:w-[260px] flex-col bg-transparent text-zinc-600 dark:text-zinc-400 md:flex flex-shrink-0 z-10">
            <div className="flex h-16 items-center gap-3 px-6 shrink-0 pt-2">
              <Image src="/logo.png" alt="PromptWalt" width={28} height={28} className="rounded-md" />
              <span className="text-lg font-bold font-sans text-zinc-900 dark:text-white tracking-tight">PromptWalt</span>
            </div>
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              <Link href="/">
                <Button variant="ghost" className="w-full justify-start h-10 px-3 rounded-lg text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                  <span>Home</span>
                </Button>
              </Link>
              <Link href="/explore">
                <Button variant="ghost" className="w-full justify-start h-10 px-3 rounded-lg bg-white shadow-sm text-zinc-900 dark:bg-[#1a1b23] dark:text-indigo-50 dark:shadow-none font-semibold">
                  <Compass className="mr-3 h-[18px] w-[18px] dark:text-indigo-400 text-blue-600" />
                  <span>Explore</span>
                </Button>
              </Link>
              <div className="pt-6 px-3">
                <div className="p-4 rounded-2xl bg-white/70 dark:bg-white/5 border border-zinc-200/60 dark:border-white/10 text-center">
                  <Sparkles className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs font-semibold text-zinc-900 dark:text-white mb-1">Create Your Vault</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-3">Save prompts and organize with custom categories.</p>
                  <Link href="/login?mode=signup">
                    <Button size="sm" className="w-full text-xs rounded-full h-8">
                      Sign Up Free
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="p-4 shrink-0 mt-auto flex items-center justify-between border-t border-zinc-200/50 dark:border-white/5">
              <Link href="/login" className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                <LogIn className="w-4 h-4" /> Log In
              </Link>
              <ThemeToggle />
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden relative">

          {/* Header Bar */}
          <header className="flex h-16 md:h-20 items-center justify-between shrink-0 bg-transparent px-3 sm:px-6 gap-2 sm:gap-4 border-b border-zinc-200/50 dark:border-white/5">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              {user ? (
                <MobileSidebar activePath="/explore" />
              ) : (
                <Link href="/" className="flex items-center gap-2 md:hidden shrink-0">
                  <Image src="/logo.png" alt="PromptWalt" width={24} height={24} className="rounded-md" />
                  <span className="font-bold text-sm hidden xs:inline">PromptWalt</span>
                </Link>
              )}

              <SearchBar basePath="/explore" placeholder="Search community prompts..." className="flex-1 min-w-0 max-w-md" />
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {user ? (
                <Link href="/profile" className="flex items-center gap-2 sm:gap-3 bg-zinc-100 dark:bg-white/5 rounded-full p-1 sm:pr-2.5 md:pr-3 border border-zinc-200 dark:border-white/10 cursor-pointer hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors shrink-0">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-indigo-500 overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <span className="hidden sm:inline text-xs font-medium font-sans text-zinc-700 dark:text-zinc-300 truncate max-w-[90px] sm:max-w-[120px]">
                    {user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                  </span>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="rounded-full text-xs h-8 sm:h-9">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/login?mode=signup">
                    <Button size="sm" className="rounded-full text-xs h-8 sm:h-9 shadow-md shadow-primary/20">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </header>

          {/* Opaque App Content Shell */}
          <div className="flex-1 bg-white dark:bg-[#0e0f11] rounded-tl-3xl border-t border-l border-white dark:border-white/5 flex flex-col overflow-y-auto shadow-2xl shadow-slate-200 dark:shadow-2xl">

            {/* Header Section */}
            <div className="px-4 sm:px-6 py-6 sm:py-8 pb-4 shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2 border border-blue-500/20">
                    <Globe className="w-3.5 h-3.5" /> Public Community Feed
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-zinc-900 dark:text-white mb-1">
                    Explore Prompts
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                    Discover and fork prompts made public by creators across ChatGPT, Claude, Midjourney and more.
                  </p>
                </div>

                {user && (
                  <div className="flex items-center gap-3">
                    <NewPromptDialog
                      categories={categories}
                      triggerText="Post a Prompt"
                      triggerClassName="inline-flex items-center justify-center rounded-full text-xs sm:text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 gap-2"
                    />
                  </div>
                )}
              </div>

              {/* Filter Toolbar */}
              <Toolbar
                basePath="/explore"
                promptCount={promptsWithUrls.length}
                models={allModels}
                tags={allTags}
                label="Public Prompts"
              />
            </div>

            {/* Prompts Feed */}
            <div className="px-4 sm:px-6 pb-12 pt-2">
              {searchQuery && (
                <div className="mb-4 flex items-center justify-between gap-2 px-3.5 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-700 dark:text-blue-300">
                  <div className="flex items-center gap-2 truncate">
                    <Search className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                    <span className="truncate">
                      Search results for: <strong>&ldquo;{searchQuery}&rdquo;</strong> ({promptsWithUrls.length} {promptsWithUrls.length === 1 ? 'prompt' : 'prompts'} found)
                    </span>
                  </div>
                  <Link
                    href="/explore"
                    className="shrink-0 flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Clear
                  </Link>
                </div>
              )}
              {promptsWithUrls.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 sm:p-16 my-8 rounded-2xl border border-dashed border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/5 text-center max-w-xl mx-auto">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 border border-blue-500/20">
                    <Compass className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                    {searchQuery || modelFilter || tagFilter ? 'No matching community prompts' : 'No public prompts yet'}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
                    {searchQuery || modelFilter || tagFilter
                      ? 'Try clearing your search query or filters to discover more prompts.'
                      : 'Be the first creator to share a prompt with the community! By default, prompts stay private in your vault until you choose to publish them.'}
                  </p>

                  {user ? (
                    <NewPromptDialog
                      categories={categories}
                      triggerText="Publish First Prompt"
                      triggerClassName="inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 h-10 px-6 gap-2"
                    />
                  ) : (
                    <Link href="/login?mode=signup">
                      <Button className="rounded-full text-sm h-10 px-6 gap-2">
                        Join to Share Prompts <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className={viewMode === 'list' ? "flex flex-col gap-4" : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}>
                  {promptsWithUrls.map((prompt) => {
                    const authorName = prompt.author_name || 'Community Creator'
                    const authorAvatar = prompt.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorName}`

                    return (
                      <ExploreDetailDialog key={prompt.id} prompt={prompt} isLoggedIn={!!user}>
                        <div className={`bg-white border border-zinc-200 dark:bg-[#1a1b1e] dark:border-white/5 rounded-xl flex hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-md transition-all group overflow-hidden h-full text-left shadow-sm dark:shadow-none cursor-pointer ${viewMode === 'list' ? 'flex-row items-stretch' : 'flex-col'}`}>

                          {/* Image Thumbnail or Code Syntax Box */}
                          <div className={`${viewMode === 'list' ? 'w-48 sm:w-64 p-3 pr-0 shrink-0 flex flex-col' : 'p-3 pb-0'}`}>
                            {prompt.signedUrls && prompt.signedUrls.length > 0 ? (
                              <div className={`${viewMode === 'list' ? 'h-full w-full' : 'aspect-[4/3]'} rounded-lg overflow-hidden relative bg-zinc-100 dark:bg-zinc-900`}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={prompt.signedUrls[0]}
                                  alt={prompt.title || 'Prompt thumbnail'}
                                  className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300 absolute inset-0"
                                />
                                {prompt.signedUrls.length > 1 && (
                                  <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded z-10 backdrop-blur-sm">
                                    1/{prompt.signedUrls.length}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className={`${viewMode === 'list' ? 'h-full w-full' : 'aspect-[4/3]'} rounded-lg bg-zinc-50 border border-zinc-100 dark:bg-[#0e0f11] dark:border-white/5 p-4 flex flex-col gap-2 font-mono text-xs overflow-hidden relative`}>
                                <div className="text-zinc-400 dark:text-zinc-500 text-[10px] uppercase font-semibold flex items-center gap-1.5 relative z-10">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Prompt
                                </div>
                                <div className="text-zinc-600 dark:text-zinc-400 mt-1 whitespace-pre-wrap line-clamp-4 relative z-10 leading-relaxed font-sans">
                                  {prompt.prompt_text}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 dark:from-[#0e0f11] via-transparent to-transparent pointer-events-none z-20"></div>
                              </div>
                            )}
                          </div>

                          {/* Details & Actions */}
                          <div className="p-4 flex-1 flex flex-col min-w-0">

                            {/* Author & Model header */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div className="w-5 h-5 rounded-full overflow-hidden bg-indigo-500 shrink-0 border border-white dark:border-zinc-800 shadow-xs">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[110px]">
                                  {authorName}
                                </span>
                              </div>

                              {prompt.model_used && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-white/5 dark:text-zinc-400 dark:border-white/10 font-medium shrink-0">
                                  {prompt.model_used}
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <h3 className="font-semibold text-sm sm:text-[15px] text-zinc-900 dark:text-white leading-tight mb-2 truncate group-hover:text-primary transition-colors">
                              {prompt.title || 'Untitled Prompt'}
                            </h3>

                            {/* Prompt Snippet */}
                            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-3 flex-1 leading-relaxed">
                              {prompt.prompt_text}
                            </p>

                            {/* Tags */}
                            {prompt.tags && prompt.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {prompt.tags.slice(0, 3).map((tag: string) => (
                                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 dark:bg-white/5 dark:text-zinc-400">
                                    #{tag}
                                  </span>
                                ))}
                                {prompt.tags.length > 3 && (
                                  <span className="text-[10px] text-zinc-400 self-center">
                                    +{prompt.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Bottom bar with timestamp and card actions */}
                            <div className="mt-auto pt-3 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between gap-2">
                              <span className="text-[11px] text-zinc-400">
                                {new Date(prompt.created_at).toLocaleDateString()}
                              </span>

                              <ExploreCardActions
                                promptId={prompt.id}
                                promptText={prompt.prompt_text}
                                title={prompt.title || 'Prompt'}
                                isLoggedIn={!!user}
                              />
                            </div>

                          </div>
                        </div>
                      </ExploreDetailDialog>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

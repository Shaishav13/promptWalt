import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { MobileSidebar } from '@/components/mobile-sidebar'
import Link from 'next/link'
import { AnalyticsClient } from './analytics-client'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch prompts
  const { data: prompts } = await supabase
    .from('prompts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  // Fetch shares created by user
  const { data: shares } = await supabase
    .from('shares')
    .select('*')
    .eq('shared_by', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="flex h-screen overflow-hidden text-zinc-900 font-sans bg-slate-100 dark:text-zinc-100 dark:bg-[#090a0f] relative">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 left-0 w-[60%] h-[60%] rounded-full bg-blue-400/20 dark:bg-blue-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-400/20 dark:bg-teal-500/10 blur-[100px] pointer-events-none" />

      <div className="z-10 flex h-full w-full">
        <Sidebar activePath="/analytics" />

        {/* Main Area */}
        <div className="flex flex-1 flex-col overflow-hidden relative">
          {/* Header Bar with Mobile Sidebar trigger and User Profile in top right */}
          <header className="flex h-16 md:h-20 items-center justify-between shrink-0 bg-transparent px-4 sm:px-6 gap-4 border-b border-zinc-200/50 dark:border-white/5">
            <div className="flex items-center gap-4 flex-1">
              <MobileSidebar />
            </div>
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <Link href="/profile" className="flex items-center gap-2 sm:gap-3 bg-zinc-100 dark:bg-white/5 rounded-full p-1 pr-2.5 sm:pr-3 border border-zinc-200 dark:border-white/10 cursor-pointer hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors">
                <div className="w-6 h-6 rounded-full bg-teal-500 overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-medium font-sans text-zinc-700 dark:text-zinc-300 truncate max-w-[100px] sm:max-w-[120px]">
                  {user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                </span>
              </Link>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto flex flex-col bg-white/40 dark:bg-black/20 backdrop-blur-sm">
            <AnalyticsClient 
              prompts={prompts || []} 
              categories={categories || []} 
              initialShares={shares || []} 
            />
          </main>
        </div>
      </div>
    </div>
  )
}

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { MobileSidebar } from '@/components/mobile-sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ProfileClient } from './profile-client'
import Link from 'next/link'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { count: totalPrompts } = await supabase
    .from('prompts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: totalFavorites } = await supabase
    .from('prompts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_favorite', true)

  const { count: totalCategories } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const displayName = user.user_metadata?.display_name || 'User'
  const memberSince = new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="flex h-screen overflow-hidden text-zinc-900 font-sans bg-slate-100 dark:text-zinc-100 dark:bg-[#090a0f] relative">
      {/* Decorative ambient glow (Blue/Green professional combo) */}
      <div className="absolute top-0 left-0 w-[60%] h-[60%] rounded-full bg-blue-400/20 dark:bg-blue-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-400/20 dark:bg-teal-500/10 blur-[100px] pointer-events-none" />
      
      <div className="z-10 flex h-full w-full">
        <Sidebar activePath="/profile" />

        {/* Main Area */}
        <div className="flex flex-1 flex-col overflow-hidden relative">
          {/* Header Bar */}
          <header className="flex h-16 md:h-20 items-center justify-between shrink-0 bg-transparent px-4 sm:px-6 gap-4">
            <div className="flex items-center gap-4 flex-1">
              <MobileSidebar />
            </div>
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <Link href="/profile" className="flex items-center gap-2 sm:gap-3 bg-zinc-100 dark:bg-white/5 rounded-full p-1 pr-2.5 sm:pr-3 border border-zinc-200 dark:border-white/10 cursor-pointer hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors">
                <div className="w-6 h-6 rounded-full bg-indigo-500 overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-medium font-sans text-zinc-700 dark:text-zinc-300 truncate max-w-[100px] sm:max-w-[120px]">
                  {displayName}
                </span>
              </Link>
            </div>
          </header>

          {/* Opaque App Content Shell */}
          <div className="flex-1 bg-white dark:bg-[#0e0f11] rounded-tl-3xl border-t border-l border-white dark:border-white/5 flex flex-col overflow-hidden shadow-2xl shadow-slate-200 dark:shadow-2xl">
            <div className="px-6 py-8 pb-4 shrink-0">
              <h1 className="text-3xl font-bold font-sans tracking-tight text-zinc-900 dark:text-white mb-1">Profile</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">View and update your personal details</p>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="max-w-2xl mx-auto px-6 pb-12 space-y-4">
                <ProfileClient
                  initialName={displayName}
                  initialEmail={user.email || ''}
                  initialAvatarUrl={user.user_metadata?.avatar_url || ''}
                  memberSince={memberSince}
                  totalPrompts={totalPrompts || 0}
                  totalFavorites={totalFavorites || 0}
                  totalCategories={totalCategories || 0}
                />
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { MobileSidebar } from '@/components/mobile-sidebar'
import { ProfileHeader } from './profile-header'
import { ScrollArea } from '@/components/ui/scroll-area'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch stats
  const { count: totalPrompts } = await supabase
    .from('prompts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const displayName = user.user_metadata?.display_name || 'User'

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <Sidebar />

      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-14 items-center gap-4 border-b bg-white px-4 dark:bg-zinc-900 lg:px-6">
          <MobileSidebar />
          <div className="flex-1 font-semibold text-lg">Your Profile</div>
          
          <ProfileHeader initialName={displayName} initialEmail={user.email || ''} />
        </header>

        <ScrollArea className="flex-1 p-6 lg:p-12">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Header Card */}
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                      {displayName}
                    </h1>
                    <span className="text-lg text-zinc-500">
                      {user.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-center">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Total Prompts</h3>
                <p className="text-4xl font-bold text-primary">{totalPrompts || 0}</p>
              </div>
              
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-center">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Account Status</h3>
                <p className="text-lg font-medium text-green-600 dark:text-green-400">Active</p>
              </div>
            </div>

          </div>
        </ScrollArea>
      </main>
    </div>
  )
}

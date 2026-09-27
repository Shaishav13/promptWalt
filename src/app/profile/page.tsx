import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { MobileSidebar } from '@/components/mobile-sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ProfileClient } from './profile-client'

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
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-white px-4 dark:bg-zinc-900 lg:px-6 shrink-0">
          <MobileSidebar />
          <div className="flex-1 font-semibold text-lg">Profile</div>
        </header>
        <ScrollArea className="flex-1">
          <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
            <ProfileClient
              initialName={displayName}
              initialEmail={user.email || ''}
              memberSince={memberSince}
              totalPrompts={totalPrompts || 0}
              totalFavorites={totalFavorites || 0}
              totalCategories={totalCategories || 0}
            />
          </div>
        </ScrollArea>
      </main>
    </div>
  )
}

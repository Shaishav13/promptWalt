import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { MobileSidebar } from '@/components/mobile-sidebar'
import Link from 'next/link'
import { BarChart2, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex h-screen overflow-hidden text-zinc-900 font-sans bg-slate-100 dark:text-zinc-100 dark:bg-[#090a0f] relative">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 left-0 w-[60%] h-[60%] rounded-full bg-blue-400/20 dark:bg-blue-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-400/20 dark:bg-teal-500/10 blur-[100px] pointer-events-none" />

      <div className="z-10 flex h-full w-full">
        <Sidebar activePath="/analytics" />

        {/* Main Area */}
        <div className="flex flex-1 flex-col overflow-hidden relative">
          {/* Header Bar */}
          <header className="flex flex-col gap-4 p-4 md:h-20 md:flex-row md:items-center justify-between shrink-0 bg-transparent px-6 border-b border-zinc-200/50 dark:border-white/5">
            <div className="flex items-center gap-4 w-full md:w-auto flex-1">
              <MobileSidebar />
            </div>
            <div className="flex items-center gap-4">
              <Link href="/profile" className="hidden md:flex items-center gap-3 bg-zinc-100 dark:bg-white/5 rounded-full p-1 pr-3 border border-zinc-200 dark:border-white/10 cursor-pointer hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors">
                <div className="w-6 h-6 rounded-full bg-teal-500 overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-medium font-sans text-zinc-700 dark:text-zinc-300 truncate max-w-[120px]">
                  {user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                </span>
              </Link>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center mb-8 border border-teal-100 dark:border-teal-500/20 shadow-sm">
              <BarChart2 className="w-10 h-10 text-teal-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-zinc-900 dark:text-white">Prompt Analytics</h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-lg mb-8">
              Soon you will be able to track your prompt usage, view detailed statistics, and analyze generation costs over time.
            </p>
            <Link href="/">
              <Button size="lg" className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all">
                <Home className="mr-2 h-5 w-5" /> Back to Dashboard
              </Button>
            </Link>
          </main>
        </div>
      </div>
    </div>
  )
}

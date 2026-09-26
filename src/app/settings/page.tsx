import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { MobileSidebar } from '@/components/mobile-sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import Link from 'next/link'
import { ShieldCheck, ChevronRight } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-white px-4 dark:bg-zinc-900 lg:px-6 shrink-0">
          <MobileSidebar />
          <div className="flex-1 font-semibold text-lg">Settings</div>
        </header>
        <ScrollArea className="flex-1 p-6 lg:p-12">
          <div className="max-w-xl mx-auto space-y-6">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
              <div className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                Legal
              </div>
              <Link href="/privacy-policy">
                <div className="flex items-center justify-between px-4 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
                      <ShieldCheck className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Privacy Policy</p>
                      <p className="text-xs text-zinc-400 mt-0.5">How we handle your data</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors" />
                </div>
              </Link>
            </div>
          </div>
        </ScrollArea>
      </main>
    </div>
  )
}

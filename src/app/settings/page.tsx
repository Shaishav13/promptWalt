import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { MobileSidebar } from '@/components/mobile-sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import Link from 'next/link'
import { ShieldCheck, ChevronRight, Database, HelpCircle } from 'lucide-react'
import { ImportDataDialog } from '@/components/import-data-dialog'
import { ImportHelpDialog } from '@/components/import-help-dialog'
import { DeleteAccountDialog } from '@/components/delete-account-dialog'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex h-screen overflow-hidden text-zinc-900 font-sans bg-slate-100 dark:text-zinc-100 dark:bg-[#090a0f] relative">
      {/* Decorative ambient glow (Blue/Green professional combo) */}
      <div className="absolute top-0 left-0 w-[60%] h-[60%] rounded-full bg-blue-400/20 dark:bg-blue-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-400/20 dark:bg-teal-500/10 blur-[100px] pointer-events-none" />

      <div className="z-10 flex h-full w-full">
        <Sidebar activePath="/settings" />

        {/* Main Area */}
        <div className="flex flex-1 flex-col overflow-hidden relative">
          {/* Header Bar */}
          <header className="flex flex-col gap-4 p-4 md:h-20 md:flex-row md:items-center justify-between shrink-0 bg-transparent px-6">
            <div className="flex items-center gap-4 w-full md:w-auto flex-1">
              <MobileSidebar />
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
            </div>
          </header>

          {/* Opaque App Content Shell */}
          <div className="flex-1 bg-white dark:bg-[#0e0f11] rounded-tl-3xl border-t border-l border-white dark:border-white/5 flex flex-col overflow-hidden shadow-2xl shadow-slate-200 dark:shadow-2xl">
            <div className="px-6 py-8 pb-4 shrink-0">
              <h1 className="text-3xl font-bold font-sans tracking-tight text-zinc-900 dark:text-white mb-1">Settings</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your account and preferences</p>
            </div>

            <ScrollArea className="flex-1 px-6 pb-6">
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
                  <div className="border-t border-zinc-100 dark:border-zinc-800" />
                  <Link href="/faq">
                    <div className="flex items-center justify-between px-4 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-500/10">
                          <HelpCircle className="h-4 w-4 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">FAQ</p>
                          <p className="text-xs text-zinc-400 mt-0.5">Frequently asked questions</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors" />
                    </div>
                  </Link>
                </div>

                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                  <div className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                    Data Management
                  </div>
                  <div className="flex items-center justify-between px-4 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 dark:bg-green-500/10">
                        <Database className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Import Data</p>
                          <ImportHelpDialog />
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">Import your ChatGPT history</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <ImportDataDialog />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-red-200 dark:border-red-900/30 bg-white dark:bg-zinc-900 overflow-hidden">
                  <div className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-red-500 border-b border-red-100 dark:border-red-900/30">
                    Danger Zone
                  </div>
                  <div className="flex items-center justify-between px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Delete Account</p>
                      <p className="text-xs text-zinc-500 mt-0.5">Permanently delete your account and all data</p>
                    </div>
                    <div className="flex-shrink-0">
                      <DeleteAccountDialog />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}

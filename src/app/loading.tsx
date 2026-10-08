import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-100 dark:bg-[#090a0f] text-zinc-900 dark:text-zinc-100">
      <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-80" />
        <p className="text-sm text-zinc-500 font-medium">Loading your workspace...</p>
      </div>
    </div>
  )
}

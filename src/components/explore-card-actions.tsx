'use client'

import { useState } from 'react'
import { Copy, Check, BookmarkPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { clonePublicPrompt, logPromptUsage } from '@/app/actions'
import { useRouter } from 'next/navigation'

interface ExploreCardActionsProps {
  promptId: string
  promptText: string
  title?: string
  isLoggedIn: boolean
}

export function ExploreCardActions({ promptId, promptText, title, isLoggedIn }: ExploreCardActionsProps) {
  const [copied, setCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    navigator.clipboard.writeText(promptText)
    setCopied(true)
    toast.success("Prompt copied to clipboard!")
    logPromptUsage(promptId)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveToVault = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (!isLoggedIn) {
      toast.info("Please log in to save prompts to your vault.")
      router.push('/login?returnUrl=/explore')
      return
    }

    setIsSaving(true)
    try {
      const res = await clonePublicPrompt(promptId)
      if (res?.error) {
        if (res.redirect) {
          router.push(res.redirect)
        } else {
          toast.error(res.error)
        }
      } else {
        toast.success(`"${title || 'Prompt'}" saved to your private vault!`)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save prompt.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={handleCopy}
        title="Copy prompt text"
        aria-label="Copy prompt text"
        className="inline-flex items-center justify-center gap-1 h-8 px-2.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Copied</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            <span className="text-[11px]">Copy</span>
          </>
        )}
      </button>

      <button
        onClick={handleSaveToVault}
        disabled={isSaving}
        title="Save to My Vault"
        aria-label="Save to My Vault"
        className="inline-flex items-center justify-center gap-1 h-8 px-2.5 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-all disabled:opacity-50"
      >
        {isSaving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <BookmarkPlus className="h-3.5 w-3.5" />
        )}
        <span className="text-[11px]">Save</span>
      </button>
    </div>
  )
}

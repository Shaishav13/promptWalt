'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Copy, Check, BookmarkPlus, Loader2, Globe, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { clonePublicPrompt, logPromptUsage } from '@/app/actions'
import { useRouter } from 'next/navigation'

interface ExploreDetailDialogProps {
  children: React.ReactNode
  prompt: {
    id: string
    title?: string | null
    prompt_text: string
    model_used?: string | null
    tags?: string[] | null
    signedUrls?: string[]
    created_at: string
    usage_count?: number
    author_name?: string | null
    author_avatar?: string | null
  }
  isLoggedIn: boolean
}

export function ExploreDetailDialog({ children, prompt, isLoggedIn }: ExploreDetailDialogProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const router = useRouter()

  const authorName = prompt.author_name || 'Community Creator'
  const authorAvatar = prompt.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorName}`

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.prompt_text)
    setCopied(true)
    toast.success("Prompt copied to clipboard!")
    logPromptUsage(prompt.id)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveToVault = async () => {
    if (!isLoggedIn) {
      toast.info("Please log in to save prompts to your vault.")
      router.push('/login?returnUrl=/explore')
      return
    }

    setIsSaving(true)
    try {
      const res = await clonePublicPrompt(prompt.id)
      if (res?.error) {
        if (res.redirect) {
          router.push(res.redirect)
        } else {
          toast.error(res.error)
        }
      } else {
        toast.success(`"${prompt.title || 'Prompt'}" saved to your private vault!`)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save prompt.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<div className="cursor-pointer h-full block w-full text-left" />} {...{ nativeButton: false } as any}>
        {children}
      </DialogTrigger>
      <DialogContent closeButtonClassName="md:hidden" className="sm:max-w-[850px] w-[95vw] p-0 md:overflow-hidden overflow-y-auto max-h-[90vh] bg-white dark:bg-zinc-950 border-0 shadow-2xl flex flex-col">
        <div className={`flex flex-col ${prompt.signedUrls && prompt.signedUrls.length > 0 ? 'md:flex-row' : ''} md:h-[620px]`}>
          
          {/* Images Section */}
          {prompt.signedUrls && prompt.signedUrls.length > 0 && (
            <div className="w-full md:w-1/2 bg-zinc-100 dark:bg-zinc-900 relative min-h-[250px] md:min-h-0 flex items-center justify-center overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={prompt.signedUrls[currentImageIndex]} 
                alt={`${prompt.title || 'Prompt demo'} ${currentImageIndex + 1}`} 
                className="w-full h-full object-cover" 
              />
              
              {prompt.signedUrls.length > 1 && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full h-8 w-8 backdrop-blur-sm transition-opacity border border-white/10"
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : prompt.signedUrls!.length - 1)) }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full h-8 w-8 backdrop-blur-sm transition-opacity border border-white/10"
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev < prompt.signedUrls!.length - 1 ? prev + 1 : 0)) }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </Button>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 px-2.5 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                    {prompt.signedUrls.map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentImageIndex ? 'bg-white w-3' : 'bg-white/50'}`} 
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Details Section */}
          <div className={`w-full ${prompt.signedUrls && prompt.signedUrls.length > 0 ? 'md:w-1/2 border-l' : 'md:w-full'} flex flex-col h-full border-zinc-200 dark:border-zinc-800`}>
            
            {/* Header */}
            <DialogHeader className="p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800/80 flex-shrink-0 text-left">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight">
                    {prompt.title || 'Untitled Prompt'}
                  </DialogTitle>
                  <DialogDescription className="mt-2 text-left flex flex-wrap items-center gap-2">
                    {/* Author chip */}
                    <span className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-white/5 rounded-full py-0.5 px-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      <span className="w-4 h-4 rounded-full overflow-hidden bg-indigo-500 shrink-0 inline-block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
                      </span>
                      <span className="truncate max-w-[120px]">{authorName}</span>
                    </span>

                    {prompt.model_used && (
                      <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {prompt.model_used}
                      </span>
                    )}

                    <span className="text-[11px] text-zinc-400">
                      {new Date(prompt.created_at).toLocaleDateString()}
                    </span>
                  </DialogDescription>
                </div>

                <div className="shrink-0 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    <Globe className="w-3 h-3" /> Explore
                  </span>
                </div>
              </div>
            </DialogHeader>

            {/* Prompt Content */}
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Prompt Text
                  </h4>
                  <div className="text-xs text-zinc-400">
                    {prompt.usage_count ? `${prompt.usage_count} uses` : 'Community prompt'}
                  </div>
                </div>

                <div className="relative group/copy rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#090a0f] p-4 font-mono text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap select-text">
                  {prompt.prompt_text}
                </div>
              </div>

              {prompt.tags && prompt.tags.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {prompt.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-[#0c0d12] flex items-center justify-between gap-3 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-2 h-10 px-4 text-xs font-medium rounded-lg"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy Prompt'}</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveToVault}
                  disabled={isSaving}
                  className="gap-2 h-10 px-4 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookmarkPlus className="w-4 h-4" />}
                  <span>Save to My Vault</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="h-10 px-3 text-xs"
                >
                  Close
                </Button>
              </div>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

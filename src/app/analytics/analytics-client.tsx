'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  BarChart2, 
  Share2, 
  Eye, 
  ShieldCheck, 
  ShieldAlert, 
  Copy, 
  Check, 
  ExternalLink, 
  Lock, 
  RefreshCw, 
  Flame, 
  Sparkles, 
  ChevronRight,
  TrendingUp,
  Layers,
  ArrowUpRight,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { disableShareLink, createShareLink } from '@/app/actions'

export interface AnalyticsPrompt {
  id: string
  title: string | null
  prompt_text: string
  model_used: string | null
  tags: string[] | null
  usage_count: number | null
  last_used_at: string | null
  visibility: string | null
  created_at: string
  category_id: string | null
  is_favorite: boolean | null
}

export interface AnalyticsCategory {
  id: string
  name: string
  color: string | null
}

export interface AnalyticsShare {
  id: string
  prompt_id: string
  share_token: string
  is_active?: boolean | null
  view_count?: number | null
  created_at: string
  last_viewed_at?: string | null
}

interface AnalyticsClientProps {
  prompts: AnalyticsPrompt[]
  categories: AnalyticsCategory[]
  initialShares: AnalyticsShare[]
}

export function AnalyticsClient({ prompts, categories, initialShares }: AnalyticsClientProps) {
  const [shares, setShares] = useState<AnalyticsShare[]>(initialShares)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [disablingId, setDisablingId] = useState<string | null>(null)
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)
  const [shareFilter, setShareFilter] = useState<'all' | 'active' | 'revoked'>('all')

  // Calculate high-level stats
  const totalPrompts = prompts.length
  const totalPromptUsages = prompts.reduce((sum, p) => sum + (p.usage_count || 0), 0)
  const totalSharesCreated = shares.length
  const activeShares = shares.filter(s => s.is_active !== false)
  const revokedShares = shares.filter(s => s.is_active === false)
  const totalLinkViews = shares.reduce((sum, s) => sum + (s.view_count || 0), 0)

  // Map category lookup
  const categoryMap = new Map(categories.map(c => [c.id, c]))
  // Map prompt lookup
  const promptMap = new Map(prompts.map(p => [p.id, p]))

  // Model breakdown
  const modelUsageMap: Record<string, { count: number; usages: number }> = {}
  prompts.forEach(p => {
    const model = p.model_used?.trim() || 'Unspecified'
    if (!modelUsageMap[model]) {
      modelUsageMap[model] = { count: 0, usages: 0 }
    }
    modelUsageMap[model].count += 1
    modelUsageMap[model].usages += (p.usage_count || 0)
  })
  const modelStats = Object.entries(modelUsageMap)
    .map(([model, data]) => ({ model, ...data }))
    .sort((a, b) => b.usages - a.usages || b.count - a.count)

  // Top prompts by usage
  const topUsedPrompts = [...prompts]
    .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
    .slice(0, 5)

  // Shares enriched with prompt info
  const enrichedShares = shares.map(s => {
    const prompt = promptMap.get(s.prompt_id)
    const category = prompt?.category_id ? categoryMap.get(prompt.category_id) : undefined
    return {
      ...s,
      promptTitle: prompt?.title || 'Untitled Prompt',
      promptText: prompt?.prompt_text || '',
      modelUsed: prompt?.model_used || 'General',
      categoryName: category?.name,
      categoryColor: category?.color,
      isActive: s.is_active !== false,
      viewCount: s.view_count || 0
    }
  })

  // Filtered shares for the modal
  const filteredShares = enrichedShares.filter(s => {
    if (shareFilter === 'active') return s.isActive
    if (shareFilter === 'revoked') return !s.isActive
    return true
  })

  // Handle link copy
  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/share/${token}`
    navigator.clipboard.writeText(url)
    setCopiedToken(token)
    toast.success('Share link copied to clipboard!')
    setTimeout(() => setCopiedToken(null), 2500)
  }

  // Handle disabling/revoking an active share link
  const handleDisableShare = async (shareId: string) => {
    setDisablingId(shareId)
    try {
      const res = await disableShareLink(shareId)
      if (res?.error) {
        toast.error(res.error)
      } else {
        // Optimistically update status to inactive
        setShares(prev => prev.map(s => s.id === shareId ? { ...s, is_active: false } : s))
        toast.success('Link deactivated! Access revoked immediately to protect your prompt.')
      }
    } catch {
      toast.error('Failed to disable link. Please try again.')
    } finally {
      setDisablingId(null)
    }
  }

  // Handle re-sharing with a fresh secure token
  const handleRegenerateShare = async (promptId: string, oldShareId: string) => {
    setRegeneratingId(oldShareId)
    try {
      // Force new fresh share link
      const res = await createShareLink(promptId, true, true)
      if (res?.error) {
        toast.error(res.error)
      } else if (res?.token) {
        // Add new active share and keep old one as revoked
        const newShare: AnalyticsShare = {
          id: crypto.randomUUID(),
          prompt_id: promptId,
          share_token: res.token,
          is_active: true,
          view_count: 0,
          created_at: new Date().toISOString()
        }
        setShares(prev => [newShare, ...prev.map(s => s.id === oldShareId ? { ...s, is_active: false } : s)])
        const newUrl = `${window.location.origin}/share/${res.token}`
        navigator.clipboard.writeText(newUrl)
        toast.success('New secure share link created and copied to clipboard! The previous link remains permanently revoked.')
      }
    } catch {
      toast.error('Failed to create new share link.')
    } finally {
      setRegeneratingId(null)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 space-y-8 max-w-7xl mx-auto w-full">
      {/* Top Welcome & Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/60 dark:border-white/5 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Analytics & Insights
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Track your prompt usage, monitor public links, and safeguard your shared prompts.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setIsViewModalOpen(true)}
            className="rounded-full shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Manage Shared Links ({activeShares.length} Active)
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Prompt Uses */}
        <div className="relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-white/5 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Prompt Uses
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 dark:bg-amber-400/10 dark:text-amber-400 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">
              {totalPromptUsages}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">executions / copies</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Across {totalPrompts} saved prompts</span>
          </p>
        </div>

        {/* Links Shared */}
        <div className="relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-white/5 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Shared Links
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 dark:bg-indigo-400/10 dark:text-indigo-400 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">
              {totalSharesCreated}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">links generated</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />
            <span>{activeShares.length} active</span>
            <span className="mx-1">•</span>
            <span className="text-zinc-400">{revokedShares.length} revoked</span>
          </p>
        </div>

        {/* Total Link Views (Opens by other users) */}
        <div className="relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-white/5 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Link Views
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 dark:bg-blue-400/10 dark:text-blue-400 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">
              {totalLinkViews}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">link opens</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
            Times others opened your shared links
          </p>
        </div>

        {/* Protection & Safety Status */}
        <div className="relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-white/5 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              IP Protection
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-400/10 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {activeShares.length === 0 ? 'Protected' : `${activeShares.length} Live`}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
            {activeShares.length > 0 
              ? 'Active links can be revoked anytime to prevent scraping' 
              : 'All your prompts are safely private'}
          </p>
        </div>
      </div>

      {/* Main Grid: Shared Links Visual Graph + AI Model Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Link Shared Graph & View Option Card (2 Columns on Desktop) */}
        <div className="lg:col-span-2 rounded-2xl p-6 bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-white/5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Link Sharing & Views Breakdown
                  </h2>
                  <Badge variant="secondary" className="text-xs rounded-full">
                    {shares.length} Total Links
                  </Badge>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Performance and view count of your public prompt links
                </p>
              </div>

              {/* Explicit "View" option on the graph as requested */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsViewModalOpen(true)}
                className="rounded-full gap-1.5 self-start sm:self-auto border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-medium"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Shared Prompts</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Visual graph / horizontal bars of shared prompts */}
            {enrichedShares.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center px-4 border border-dashed border-zinc-200 dark:border-white/10 rounded-xl">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center mb-3 text-zinc-400">
                  <Share2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">No Shared Links Yet</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mt-1">
                  Share prompts from your dashboard to see link views, open metrics, and manage access here.
                </p>
                <Link href="/" className="mt-4">
                  <Button size="sm" variant="outline" className="rounded-full text-xs">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {enrichedShares.slice(0, 5).map((share) => {
                  const maxViews = Math.max(...enrichedShares.map(s => s.viewCount), 1)
                  const percentage = Math.min(100, Math.round((share.viewCount / maxViews) * 100))

                  return (
                    <div 
                      key={share.id} 
                      className="group p-3.5 rounded-xl border border-zinc-100 dark:border-white/5 bg-zinc-50/60 dark:bg-white/[0.02] hover:bg-zinc-100/60 dark:hover:bg-white/[0.04] transition-all"
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${share.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                            {share.promptTitle}
                          </span>
                          <span className="text-xs text-zinc-400 shrink-0 hidden sm:inline">
                            • {share.modelUsed}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-blue-500" />
                            {share.viewCount} {share.viewCount === 1 ? 'view' : 'views'}
                          </span>

                          {share.isActive ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDisableShare(share.id)}
                              disabled={disablingId === share.id}
                              className="h-7 px-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                            >
                              <Lock className="w-3 h-3 mr-1" />
                              Revoke
                            </Button>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-zinc-400 border-zinc-300 dark:border-zinc-700">
                              Revoked
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-zinc-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${share.isActive ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-zinc-400 dark:bg-zinc-600'}`}
                          style={{ width: `${Math.max(percentage, 6)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {enrichedShares.length > 0 && (
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>Showing top shared links</span>
              <button 
                onClick={() => setIsViewModalOpen(true)}
                className="font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Manage all {enrichedShares.length} links</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* AI Model Breakdown Card */}
        <div className="rounded-2xl p-6 bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-white/5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                Model Distribution
              </h2>
              <Badge variant="secondary" className="text-xs">
                {modelStats.length} Models
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
              Prompts and usage by AI generation model
            </p>

            {modelStats.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-400">
                No prompt model data recorded yet.
              </div>
            ) : (
              <div className="space-y-3.5">
                {modelStats.slice(0, 5).map((stat) => {
                  const maxModelCount = Math.max(...modelStats.map(m => m.count), 1)
                  const pct = Math.round((stat.count / maxModelCount) * 100)

                  return (
                    <div key={stat.model} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[140px]">
                          {stat.model}
                        </span>
                        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-mono">
                          <span>{stat.count} {stat.count === 1 ? 'prompt' : 'prompts'}</span>
                          <span>•</span>
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">{stat.usages} uses</span>
                        </div>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-indigo-500 transition-all duration-500"
                          style={{ width: `${Math.max(pct, 8)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Categories</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{categories.length} created</span>
          </div>
        </div>
      </div>

      {/* Top Prompt Usage Leaderboard */}
      <div className="rounded-2xl p-6 bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-white/5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>Most Used Prompts</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Your most frequently copied, executed, and utilized prompts
            </p>
          </div>
        </div>

        {topUsedPrompts.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400">
            No prompts found in your library.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-sans">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-white/5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  <th className="pb-3 pl-1">Prompt</th>
                  <th className="pb-3">Model</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Visibility</th>
                  <th className="pb-3 text-right pr-2">Usages</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                {topUsedPrompts.map((p) => {
                  const cat = p.category_id ? categoryMap.get(p.category_id) : undefined
                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 pl-1 max-w-[240px] sm:max-w-xs truncate font-medium text-zinc-900 dark:text-zinc-100">
                        {p.title || 'Untitled Prompt'}
                      </td>
                      <td className="py-3.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {p.model_used || 'General'}
                      </td>
                      <td className="py-3.5 text-xs">
                        {cat ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            <span 
                              className="w-1.5 h-1.5 rounded-full" 
                              style={{ backgroundColor: cat.color || '#6366f1' }} 
                            />
                            {cat.name}
                          </span>
                        ) : (
                          <span className="text-zinc-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3.5 text-xs">
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] capitalize ${
                            p.visibility === 'shared' 
                              ? 'border-indigo-500/30 text-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20' 
                              : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                          }`}
                        >
                          {p.visibility || 'private'}
                        </Badge>
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                          {p.usage_count || 0}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* View Shared Prompts & Revocation Modal (Explicit User Request) */}
      {/* ========================================================= */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-3xl w-[95vw] max-h-[85vh] p-0 flex flex-col overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 shadow-2xl">
          <DialogHeader className="p-6 pb-4 border-b border-zinc-100 dark:border-white/5 shrink-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-blue-500" />
                  <span>Shared Prompts & Access Control</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Manage active links, track view counts, and revoke public access to safeguard your intellectual property.
                </DialogDescription>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl shrink-0">
                <button
                  onClick={() => setShareFilter('all')}
                  className={`text-xs px-2.5 py-1 rounded-lg transition-all font-medium ${shareFilter === 'all' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
                >
                  All ({enrichedShares.length})
                </button>
                <button
                  onClick={() => setShareFilter('active')}
                  className={`text-xs px-2.5 py-1 rounded-lg transition-all font-medium ${shareFilter === 'active' ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
                >
                  Active ({activeShares.length})
                </button>
                <button
                  onClick={() => setShareFilter('revoked')}
                  className={`text-xs px-2.5 py-1 rounded-lg transition-all font-medium ${shareFilter === 'revoked' ? 'bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-xs' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
                >
                  Revoked ({revokedShares.length})
                </button>
              </div>
            </div>
          </DialogHeader>

          {/* Modal Content Scroll Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* IP Protection Notice */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-500/20 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-300">
              <ShieldAlert className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Monetization & Piracy Protection:</span> Disabling an active link immediately turns it into a revoked dead-end (404 / inactive) so unauthorized parties cannot steal or scrape your prompt text. If you decide to share again later, a brand new secure URL will be generated.
              </div>
            </div>

            {filteredShares.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 dark:text-zinc-400 text-sm">
                No {shareFilter !== 'all' ? shareFilter : ''} shared prompts found.
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredShares.map((share) => {
                  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${share.share_token}`

                  return (
                    <div 
                      key={share.id}
                      className="p-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50/40 dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-white/20 transition-all flex flex-col gap-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-zinc-900 dark:text-white truncate">
                              {share.promptTitle}
                            </h4>
                            {share.isActive ? (
                              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px]">
                                Active Link
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-[10px]">
                                Revoked / Disabled
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            <span>Model: {share.modelUsed}</span>
                            {share.categoryName && (
                              <>
                                <span>•</span>
                                <span>Category: {share.categoryName}</span>
                              </>
                            )}
                            <span>•</span>
                            <span className="font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5" />
                              {share.viewCount} {share.viewCount === 1 ? 'view' : 'views'}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                          {share.isActive ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDisableShare(share.id)}
                              disabled={disablingId === share.id}
                              className="h-8 rounded-lg text-xs font-semibold gap-1.5 shadow-xs"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>{disablingId === share.id ? 'Revoking...' : 'Disable Sharing'}</span>
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRegenerateShare(share.prompt_id, share.id)}
                              disabled={regeneratingId === share.id}
                              className="h-8 rounded-lg text-xs font-medium gap-1.5 border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${regeneratingId === share.id ? 'animate-spin' : ''}`} />
                              <span>Share Again (New Link)</span>
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* URL Box & Copy Actions */}
                      <div className="flex items-center gap-2 bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/5 rounded-lg p-1.5 pl-3 text-xs">
                        <span className="font-mono text-zinc-500 dark:text-zinc-400 truncate flex-1 select-all">
                          {shareUrl}
                        </span>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyLink(share.share_token)}
                          className="h-7 px-2.5 text-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
                          title="Copy Link"
                        >
                          {copiedToken === share.share_token ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span className="ml-1.5 hidden sm:inline">
                            {copiedToken === share.share_token ? 'Copied' : 'Copy'}
                          </span>
                        </Button>

                        {share.isActive && (
                          <Link 
                            href={`/share/${share.share_token}`} 
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                              title="Test Link in New Tab"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

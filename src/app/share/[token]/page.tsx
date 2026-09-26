import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import Link from 'next/link'

// We create a separate client component for the copy button for interactivity
import { PublicCopyButton } from '@/components/public-copy-button'

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  // 1. Find the share token
  const { data: shareData, error: shareError } = await supabase
    .from('shares')
    .select('prompt_id')
    .eq('share_token', token)
    .single()

  if (shareError || !shareData) {
    notFound()
  }

  // 2. Fetch the prompt (bypassing RLS or relying on visibility = 'shared'/'public')
  const { data: prompt, error: promptError } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', shareData.prompt_id)
    .single()

  if (promptError || !prompt) {
    notFound()
  }

  // Fetch signed URLs for images
  let signedUrls: string[] = []
  if (prompt.demo_image_urls && prompt.demo_image_urls.length > 0) {
    for (const url of prompt.demo_image_urls) {
      const { data } = await supabase.storage.from('prompt-images').createSignedUrl(url, 3600)
      if (data?.signedUrl) signedUrls.push(data.signedUrl)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{prompt.title || 'Untitled Prompt'}</h1>
            <div className="mt-2 text-sm text-zinc-500">
              Shared via <Link href="/" className="font-semibold text-primary">PromptWalt</Link>
            </div>
          </div>
          {prompt.model_used && (
            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md text-sm font-medium">
              {prompt.model_used}
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row h-auto md:h-[600px]">
          {/* Images */}
          <div className="w-full md:w-1/2 bg-zinc-100 dark:bg-zinc-950 relative border-r border-zinc-100 dark:border-zinc-800">
            {signedUrls.length > 0 ? (
              <ScrollArea className="w-full h-full">
                <div className="flex flex-col">
                  {signedUrls.map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={url} alt={`${prompt.title} ${i+1}`} className="w-full h-auto object-cover" />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="w-full h-full flex items-center justify-center p-8 text-zinc-400">
                No demo images provided
              </div>
            )}
          </div>

          {/* Details */}
          <div className="w-full md:w-1/2 flex flex-col h-full bg-white dark:bg-zinc-900">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold mb-3">Prompt</h4>
                  <div className="relative group/copy">
                    <div className="p-5 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-sm leading-relaxed border border-zinc-100 dark:border-zinc-800 whitespace-pre-wrap font-mono">
                      {prompt.prompt_text}
                    </div>
                  </div>
                </div>

                {prompt.tags && prompt.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {prompt.tags.map((tag: string) => (
                        <span key={tag} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex justify-end gap-3">
              <PublicCopyButton text={prompt.prompt_text} />
              
              <form action={async () => {
                'use server'
                const { cloneSharedPrompt } = await import('@/app/actions')
                await cloneSharedPrompt(token)
              }}>
                <Button type="submit" variant="default">
                  Save to my Library
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

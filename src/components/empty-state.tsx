import { Sparkles, Plus, Image as ImageIcon, Copy, ArrowRight } from 'lucide-react'
import { NewPromptDialog } from '@/components/new-prompt-dialog'
import { Button } from '@/components/ui/button'

export function EmptyState({ categories }: { categories: any[] }) {
  return (
    <div className="w-full max-w-5xl mx-auto mt-8 md:mt-16 animate-in fade-in zoom-in-95 duration-700">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Welcome to your Prompt Vault</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
          You haven't saved any prompts yet. PromptWalt helps you organize, discover, and reuse your best AI interactions.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center bg-white dark:bg-zinc-900/50 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-black/5">
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">What makes a great entry?</h3>
          <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
            <li className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">1</div>
              <div><strong>Clear Title & Tags:</strong> Make it easily searchable later (e.g. "React Component Expert" with tag "Coding").</div>
            </li>
            <li className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center shrink-0">2</div>
              <div><strong>The Full Prompt:</strong> Paste the exact prompt you used so you can copy it in one click next time.</div>
            </li>
            <li className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center shrink-0">3</div>
              <div><strong>Reference Images:</strong> For Midjourney or DALL-E, upload the output image so you remember what the prompt creates!</div>
            </li>
          </ul>
          
          <div className="pt-4">
            <NewPromptDialog 
              categories={categories} 
              triggerClassName="inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto h-12 px-8 rounded-full shadow-lg shadow-primary/20 gap-2 text-base"
              triggerText="Add Your First Prompt"
            />
          </div>
        </div>

        {/* Fake Prompt Card showing an ideal state */}
        <div className="relative mx-auto w-full max-w-sm transform rotate-2 hover:rotate-0 transition-transform duration-500">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-500 rounded-[24px] blur opacity-20"></div>
          <div className="relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-900 relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mix-blend-overlay"></div>
              <ImageIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />
              <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[10px] text-white font-medium">GPT-4</div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  <h4 className="font-semibold text-sm">Example: Code Reviewer</h4>
                </div>
              </div>
              <p className="text-xs text-zinc-500 line-clamp-2 mb-3">
                Act as a senior software engineer. Review the following code for performance bottlenecks, security vulnerabilities, and...
              </p>
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">coding</span>
                <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                  <Copy className="w-3 h-3" /> Used 0 times
                </div>
              </div>
            </div>
          </div>
          
          {/* Arrow pointing from CTA to Card */}
          <div className="hidden md:block absolute -left-12 bottom-12 text-primary opacity-50 transform -rotate-12">
            <ArrowRight className="w-8 h-8" />
          </div>
        </div>
      </div>
    </div>
  )
}

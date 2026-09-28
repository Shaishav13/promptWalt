import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Box, Share2, UploadCloud, ShieldCheck, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { ThemeToggle } from '@/components/theme-toggle'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="PromptWalt" width={28} height={28} className="rounded-md" />
            <span className="text-xl font-bold tracking-tight">PromptWalt</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button size="sm" className="md:h-10 md:px-4 md:py-2 rounded-full shadow-md shadow-primary/20 hover:shadow-primary/40 transition-all text-xs md:text-sm">
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-zinc-50 to-zinc-50 dark:from-primary/10 dark:via-zinc-950 dark:to-zinc-950"></div>
        <div className="max-w-5xl mx-auto text-center animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out fill-mode-both">
          {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-8 border border-indigo-500/20 shadow-sm">
            <Sparkles className="w-4 h-4" /> The ultimate AI companion
          </div> */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Never lose a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">brilliant prompt</span> again.
          </h1>
          <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            PromptWalt is your personal vault for organizing, categorizing, and sharing your best AI prompts. Built for power users of ChatGPT, Claude, and Midjourney.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login?mode=signup">
              <Button size="lg" className="rounded-full h-14 px-8 text-lg font-medium shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all w-full sm:w-auto">
                Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Mockup (Pure CSS / DOM) */}
      <section className="px-6 pb-32">
        <div className="max-w-6xl mx-auto relative perspective-1000">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-1000 delay-300 ease-out fill-mode-both transform-gpu hover:scale-[1.01] transition-transform duration-500 border border-zinc-200/50 dark:border-zinc-800/50 flex flex-col bg-zinc-100/50 dark:bg-zinc-950/50">
            {/* Fake OS Header */}
            <div className="h-8 md:h-10 border-b border-zinc-200/50 dark:border-zinc-800/50 flex items-center px-4 gap-2 shrink-0">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-400"></div>
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-amber-400"></div>
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-400"></div>
            </div>
            <Image src="/screenshot.png" alt="PromptWalt Dashboard Screenshot" width={2400} height={1600} className="w-full h-auto block" priority unoptimized={true} />
          </div>

          {/* Decorative blurs */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 dark:bg-primary/10 rounded-full blur-[100px] -z-10"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-[100px] -z-10"></div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-zinc-100 dark:bg-zinc-900 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything you need, zero friction.</h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Built for speed and elegance. Manage thousands of prompts without breaking a sweat.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-zinc-950 p-8 rounded-3xl shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                <Box className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Beautiful Organization</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Tag, categorize, and color-code your library. Find that one perfect system prompt from six months ago in seconds.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-950 p-8 rounded-3xl shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-500">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Lightning Fast Search</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Never lose a prompt again. Instantly pull up exactly what you need using real-time search, category filters, and tags.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-950 p-8 rounded-3xl shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 text-emerald-500">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Public Sharing</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Generate clean, public links for your prompts to share with colleagues or Twitter. Others can instantly clone them!
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-950 p-8 rounded-3xl shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center mb-6 text-pink-500">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Visual History</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Perfect for Midjourney. Store output images alongside your prompts so you always remember exactly what each prompt creates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="PromptWalt" width={24} height={24} className="rounded-md opacity-75" />
            <span className="font-semibold text-zinc-500">PromptWalt</span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <Link href="/privacy-policy" className="text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">
              Privacy Policy
            </Link>
            <div className="text-sm text-zinc-500 flex items-center gap-2 border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 pt-4 md:pt-0 md:pl-6">
              <ShieldCheck className="w-4 h-4" /> Private by default
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

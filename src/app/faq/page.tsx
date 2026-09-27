'use client'

import Link from 'next/link'
import { ArrowLeft, HelpCircle, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const faqs = [
  {
    question: 'What is PromptWalt?',
    answer: 'PromptWalt is a personal prompt management platform designed to help you save, organize, and retrieve AI prompts efficiently. You can categorize prompts by project or use case, attach reference images, filter by AI model, and share individual prompts via a public link — all in one place.',
  },
  {
    question: 'How do I create a new prompt?',
    answer: 'Click the "New Prompt" button located in the top-right corner of the main dashboard. You will be prompted to enter a title, the prompt text, the AI model it was used with, an optional category, and any relevant demo images. Once saved, the prompt will appear in your library immediately.',
  },
  {
    question: 'How do I organize prompts into categories?',
    answer: 'Click the "+" icon next to "Categories" in the sidebar to create a new category. You can assign it a custom name and color for easy visual identification. When creating or editing a prompt, select the desired category from the dropdown. Clicking a category in the sidebar will filter your library to show only prompts within it.',
  },
  {
    question: 'How does public prompt sharing work?',
    answer: 'Every prompt can be shared via a unique, read-only public link. Open the prompt detail view, click the share icon, and copy the generated link. Anyone with the link can view the prompt content without requiring an account. You can revoke sharing at any time by toggling the share option off.',
  },
  {
    question: 'Is my data private and secure?',
    answer: 'Yes. All prompts and associated data are private to your account by default. Only prompts you explicitly choose to share are accessible externally, and only via a direct link. Your data is stored with AES-256 encryption at rest and protected by row-level security policies, ensuring no other user can access your content.',
  },
  {
    question: 'How do I mark a prompt as a favorite?',
    answer: 'Click the heart icon on any prompt card to toggle its favorite status. Favorited prompts can be quickly accessed by clicking "Favorites" in the sidebar. This is useful for pinning your most frequently used or high-value prompts for fast retrieval.',
  },
  {
    question: 'Can I filter prompts by AI model or tag?',
    answer: 'Yes. The filter bar at the top of your dashboard allows you to narrow your library by AI model, tag, or a text search query. Filters can be combined for more precise results. The available models and tags are automatically derived from the metadata you have added to your prompts.',
  },
  {
    question: 'How do I delete my account and data?',
    answer: 'Navigate to Settings → Danger Zone and click "Delete Account". You will be asked to confirm the action. Upon confirmation, your account and all associated data — including prompts, images, and categories — will be permanently and irreversibly deleted from our systems within 30 days.',
  },
  {
    question: 'What AI models does PromptWalt support?',
    answer: 'PromptWalt is model-agnostic and does not integrate directly with any AI provider APIs. You can label a prompt with any model name — such as GPT-4o, Claude 3.5, Gemini 1.5, or a custom internal model — and use the model filter to browse prompts by that label. This makes it compatible with any current or future AI tool.',
  },
  {
    question: 'How do I update my profile or change my password?',
    answer: 'Click the menu icon in the top-right corner of the Profile page. From there, you can edit your display name and email address, or update your password. If you change your email, a confirmation link will be sent to the new address before the change takes effect.',
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  function toggle(i: number) {
    setOpenIndex(prev => (prev === i ? null : i))
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-[500px] bg-purple-500/10 dark:bg-purple-600/10 blur-[120px] rounded-[100%] pointer-events-none -z-10" />

      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 md:py-20 relative z-10">
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-12"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/20 mb-6">
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">Questions</span>
          </h1>
          <p className="text-base md:text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl">
            Everything you need to know about PromptWalt and how it helps you manage your AI workflows.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`rounded-2xl border transition-all duration-300 ${openIndex === i ? 'border-purple-200 dark:border-purple-500/30 bg-purple-50/50 dark:bg-purple-500/5 shadow-md shadow-purple-500/5' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700'}`}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-6 py-5 md:px-8 md:py-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-2xl group"
              >
                <h2 className={`text-base md:text-lg font-semibold transition-colors ${openIndex === i ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 dark:group-hover:text-purple-400'} pr-6`}>
                  {faq.question}
                </h2>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${openIndex === i ? 'bg-purple-100 dark:bg-purple-500/20' : 'bg-zinc-100 dark:bg-zinc-800 group-hover:bg-purple-50 dark:group-hover:bg-purple-500/10'}`}>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ${openIndex === i ? 'rotate-180 text-purple-600 dark:text-purple-400' : 'text-zinc-500 group-hover:text-purple-600 dark:group-hover:text-purple-400'}`}
                  />
                </div>
              </button>
              <div
                className="grid transition-all duration-300 ease-in-out"
                style={{ gridTemplateRows: openIndex === i ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-5 md:px-8 md:pb-6 pt-0">
                    <div className="h-px w-full bg-zinc-200 dark:bg-zinc-800 mb-5" />
                    <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-zinc-400 text-center mt-16 mb-8 font-medium">
          © {new Date().getFullYear()} PromptWalt. All rights reserved.
        </p>
      </div>
    </div>
  )
}

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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 md:py-20">
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="flex items-center gap-4 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-500/10">
            <HelpCircle className="h-6 w-6 text-purple-500" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">FAQ</h1>
        </div>
        <p className="text-sm text-zinc-500 mb-12 md:ml-16">Frequently asked questions about PromptWalt</p>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-6 py-6 md:px-10 md:py-7 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
              >
                <h2 className="text-base md:text-xl font-semibold text-zinc-900 dark:text-zinc-100 pr-6">
                  {i + 1}. {faq.question}
                </h2>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-zinc-400 transition-transform duration-200 ${openIndex === i ? 'rotate-180' : ''}`}
                />
              </button>
              {openIndex === i && (
                <div className="px-6 pb-6 md:px-10 md:pb-8">
                  <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed md:leading-loose max-w-4xl">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-sm text-zinc-400 text-center mt-12 mb-8">
          © {new Date().getFullYear()} PromptWalt. All rights reserved.
        </p>
      </div>
    </div>
  )
}

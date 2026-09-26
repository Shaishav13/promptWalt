import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

const sections = [
  {
    title: 'Information We Collect',
    body: 'We collect personal information you provide when creating an account, including your name and email address. We also collect content you voluntarily submit to the platform, such as prompts, images, and associated metadata. We do not collect sensitive personal information beyond what is necessary to operate the service.',
  },
  {
    title: 'How We Use Your Information',
    body: 'Your information is used exclusively to deliver, maintain, and improve the PromptWalt service. This includes authenticating your account, rendering your content, and diagnosing technical issues. We do not sell, rent, license, or otherwise disclose your personal data to third parties for commercial purposes.',
  },
  {
    title: 'Data Storage & Security',
    body: 'All user data is stored on Supabase infrastructure, which employs AES-256 encryption at rest and TLS encryption in transit. Access to your data is restricted through row-level security policies, ensuring only authenticated users can access their own content. We apply industry-standard security controls and regularly review our practices to protect your information.',
  },
  {
    title: 'Cookies & Session Data',
    body: 'PromptWalt uses strictly necessary session cookies to authenticate and maintain your logged-in state. We do not use tracking cookies, third-party advertising cookies, or any analytics tools that profile your behavior across other sites. You may clear cookies via your browser settings, though doing so will end your active session.',
  },
  {
    title: 'Data Retention',
    body: 'We retain your personal data for as long as your account remains active. If you choose to delete your account, all associated data — including prompts, images, and profile information — will be permanently removed from our systems within 30 days. Certain anonymized, aggregated data may be retained for service improvement purposes.',
  },
  {
    title: 'Your Rights',
    body: 'You have the right to access, correct, or delete your personal data at any time. Account deletion is available directly from your profile settings. If you require a copy of your data or wish to exercise any additional rights under applicable privacy law (including GDPR or CCPA), please contact us and we will respond within a reasonable timeframe.',
  },
  {
    title: 'Third-Party Services',
    body: 'PromptWalt integrates with Supabase for authentication and data storage. These services operate under their own privacy policies and are bound by data processing agreements. We do not integrate with advertising networks, social media trackers, or any third-party analytics providers.',
  },
  {
    title: 'Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time to reflect changes in our practices or legal obligations. When we do, we will revise the "Last updated" date at the top of this page. Continued use of PromptWalt after any changes constitutes your acceptance of the revised policy.',
  },
  {
    title: 'Contact',
    body: 'If you have questions, concerns, or requests regarding this Privacy Policy or the handling of your personal data, please contact us through the app. We are committed to addressing your inquiry promptly and transparently.',
  },
]

export default function PrivacyPolicyPage() {
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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
            <ShieldCheck className="h-6 w-6 text-blue-500" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Privacy Policy</h1>
        </div>
        <p className="text-sm text-zinc-500 mb-12 md:ml-16">Last updated: September 2026</p>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
          {sections.map((section, i) => (
            <div key={i} className="px-6 py-6 md:px-10 md:py-8">
              <h2 className="text-base md:text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                {i + 1}. {section.title}
              </h2>
              <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed md:leading-loose max-w-4xl">
                {section.body}
              </p>
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

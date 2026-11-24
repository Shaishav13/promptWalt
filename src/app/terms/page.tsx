import Link from 'next/link'
import { ArrowLeft, ScrollText } from 'lucide-react'

const sections = [
  {
    title: 'Acceptance of Terms',
    body: 'By accessing or using PromptWalt in any way, you unconditionally agree to these Terms and Conditions in full. If you do not agree, you must immediately stop using the service. We may update these terms at any time without prior notice, and your continued use constitutes automatic acceptance of any revised version. It is your sole responsibility to check for updates.',
  },
  {
    title: 'License to Use',
    body: 'PromptWalt grants you a limited, revocable, non-exclusive, non-transferable license to access and use the service strictly for your personal or internal business use. We reserve the right to revoke this license and suspend or terminate your access at any time, for any reason or no reason, with or without notice, at our sole discretion.',
  },
  {
    title: 'User Accounts & Responsibility',
    body: 'You are entirely responsible for all activity that occurs under your account, including any harm caused by unauthorized use. PromptWalt bears no liability for losses resulting from compromised credentials. We may suspend, restrict, or permanently delete any account at our sole discretion without prior notice, refund, or obligation to provide a reason.',
  },
  {
    title: 'Content License Grant',
    body: 'By submitting any content — including prompts, images, tags, or metadata — to PromptWalt, you grant us a perpetual, irrevocable, worldwide, royalty-free, sublicensable license to store, process, display, and use that content for any purpose related to operating, improving, and promoting the service. You warrant that you have the rights to grant this license.',
  },
  {
    title: 'Public Sharing & User Conduct',
    body: 'You are solely responsible for any content you make public or share via PromptWalt. PromptWalt accepts no liability for third-party access, misuse, or redistribution of content you choose to share. You agree not to upload, share, or transmit any content that is unlawful, harmful, infringing, or objectionable. We may remove any content and suspend any account that violates these standards, without notice.',
  },
  {
    title: 'Intellectual Property',
    body: 'All rights, title, and interest in and to PromptWalt — including its software, design, branding, features, and all associated intellectual property — are and remain the exclusive property of PromptWalt. Nothing in these terms grants you any right to use our trademarks, trade names, logos, or proprietary materials. Any unauthorized use is strictly prohibited.',
  },
  {
    title: 'No Warranties',
    body: 'PromptWalt is provided strictly "as is" and "as available," without any warranties of any kind, whether express, implied, or statutory. We expressly disclaim all implied warranties, including merchantability, fitness for a particular purpose, and non-infringement. We do not guarantee that the service will be available, uninterrupted, error-free, secure, or free from data loss. Your use is entirely at your own risk.',
  },
  {
    title: 'Limitation of Liability',
    body: 'To the maximum extent permitted by applicable law, PromptWalt and its owners, operators, employees, and agents shall not be liable for any direct, indirect, incidental, special, consequential, exemplary, or punitive damages — including loss of data, profits, or business — arising out of or in connection with your use of or inability to use the service, regardless of the theory of liability and even if we have been advised of the possibility of such damages. Our total liability to you for any claim shall not exceed the amount you paid us in the twelve months preceding the claim, or USD $10, whichever is less.',
  },
  {
    title: 'Indemnification',
    body: 'You agree to indemnify, defend, and hold harmless PromptWalt and its operators from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or related to your use of the service, your content, your violation of these terms, or your violation of any third-party rights. We reserve the right to assume exclusive control of any matter subject to indemnification, at your expense.',
  },
  {
    title: 'Service Modifications & Termination',
    body: 'We reserve the right to modify, suspend, or permanently discontinue any part of the service — including features, pricing, and availability — at any time without notice or liability to you. We may also terminate your access immediately if we determine, in our sole discretion, that you have violated these terms or pose a risk to other users or the platform.',
  },
  {
    title: 'Governing Law',
    body: 'These Terms and Conditions are governed by and construed in accordance with applicable law. Any disputes arising under these terms shall be resolved exclusively through binding arbitration or in the courts designated by PromptWalt. You waive any right to participate in class-action lawsuits or class-wide arbitration against PromptWalt.',
  },
  {
    title: 'Contact',
    body: 'If you have questions about these Terms and Conditions, you may contact us through the app. We review all inquiries but are under no obligation to respond. These terms represent the entire agreement between you and PromptWalt regarding use of the service and supersede all prior agreements.',
  },
]

export default function TermsPage() {
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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10">
            <ScrollText className="h-6 w-6 text-amber-500" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Terms &amp; Conditions</h1>
        </div>
        <p className="text-sm text-zinc-500 mb-12 md:ml-16">Last updated: November 2026</p>

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

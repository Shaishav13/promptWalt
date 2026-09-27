'use client'

import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function ImportHelpDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-full ml-1.5 translate-y-[1px]">
        <HelpCircle className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>How to export your ChatGPT history</DialogTitle>
          <DialogDescription>
            Follow these steps to get your <code>conversations.json</code> file from ChatGPT.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 text-sm text-zinc-700 dark:text-zinc-300">
          <ol className="list-decimal list-inside space-y-3">
            <li>Open ChatGPT in your browser and log in.</li>
            <li>Click on your profile picture in the bottom-left corner (or top-right) and select <strong>Settings</strong>.</li>
            <li>Go to the <strong>Data controls</strong> menu.</li>
            <li>Click on <strong>Export data</strong> and confirm the request.</li>
            <li>Check your email! You will receive a ZIP file containing your data.</li>
            <li>Extract the ZIP file. Inside, you will find a file named <strong><code>conversations.json</code></strong>.</li>
          </ol>
          <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-lg mt-6 border border-zinc-200 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Note: This file only contains your conversation history. Once you have it, close this dialog and click the <strong>Import JSON</strong> button to upload it to PromptWalt.
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => setOpen(false)}>Got it</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

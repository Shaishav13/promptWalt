'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

export function PublicCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Prompt copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button 
      onClick={handleCopy} 
      size="sm"
      variant="ghost"
      className="h-8 gap-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
      <span className="text-xs">Copy</span>
    </Button>
  )
}

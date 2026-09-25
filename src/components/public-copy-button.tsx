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
    <Button onClick={handleCopy} className="gap-2 w-full md:w-auto text-base h-12 md:h-10">
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      Copy Prompt
    </Button>
  )
}

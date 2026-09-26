'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Loader2, Check } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { bulkInsertPrompts } from '@/app/actions'

interface ExtractedPrompt {
  id: string
  prompt_text: string
  title: string
  selected: boolean
}

export function ImportDataDialog() {
  const [open, setOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [prompts, setPrompts] = useState<ExtractedPrompt[]>([])

  function generateTitle(text: string) {
    const segments = text.split(/[,.|\n]+/)
    let mainConcept = segments[0]?.trim() || "Untitled Prompt"
    if (mainConcept.length < 5 && segments.length > 1) {
      mainConcept += ` ${segments[1].trim()}`
    }
    mainConcept = mainConcept.charAt(0).toUpperCase() + mainConcept.slice(1)
    if (mainConcept.length > 45) {
      mainConcept = mainConcept.substring(0, 45) + '...'
    }
    return mainConcept
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)
        const extracted: ExtractedPrompt[] = []
        
        // Very basic ChatGPT conversations.json parser
        if (Array.isArray(json)) {
          json.forEach((convo: any) => {
            if (convo.mapping) {
              Object.values(convo.mapping).forEach((node: any) => {
                const message = node?.message
                if (message?.author?.role === 'user' && message?.content?.parts?.[0]) {
                  const text = message.content.parts[0]
                  if (typeof text === 'string' && text.length > 50) {
                    extracted.push({
                      id: crypto.randomUUID(),
                      prompt_text: text,
                      title: generateTitle(text),
                      selected: true
                    })
                  }
                }
              })
            }
          })
        }
        
        // Remove exact duplicates
        const unique = extracted.filter((v, i, a) => a.findIndex(t => (t.prompt_text === v.prompt_text)) === i)
        // Take top 50 for performance
        setPrompts(unique.slice(0, 100))
        toast.success(`Found ${unique.length} prompts!`)
      } catch (err) {
        toast.error("Failed to parse file. Please ensure it's a valid conversations.json export.")
      } finally {
        setIsProcessing(false)
      }
    }
    reader.readAsText(file)
  }

  const toggleSelect = (id: string) => {
    setPrompts(prompts.map(p => p.id === id ? { ...p, selected: !p.selected } : p))
  }

  const handleImport = async () => {
    const selected = prompts.filter(p => p.selected)
    if (selected.length === 0) {
      toast.error("Select at least one prompt to import.")
      return
    }

    setIsImporting(true)
    const res = await bulkInsertPrompts(
      selected.map(p => ({ prompt_text: p.prompt_text, title: p.title }))
    )
    setIsImporting(false)

    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success(`Imported ${selected.length} prompts!`)
      setOpen(false)
      setPrompts([])
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="ghost" className="w-full justify-start mt-1 text-primary hover:text-primary hover:bg-primary/10">
          <Download className="mr-2 h-4 w-4" />
          Import Data
        </Button>
      }>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
          <DialogTitle className="text-xl">Import from ChatGPT</DialogTitle>
          <DialogDescription className="mt-2 text-sm">
            Upload your `conversations.json` file from a ChatGPT data export. We will automatically extract your best prompts. Processing happens 100% locally in your browser.
          </DialogDescription>
        </div>

        {prompts.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <input
              type="file"
              accept=".json"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isProcessing}
            />
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full max-w-md h-32 border-2 border-dashed rounded-xl cursor-pointer bg-zinc-50 border-zinc-300 hover:bg-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isProcessing ? (
                  <>
                    <Loader2 className="w-8 h-8 mb-2 text-zinc-400 animate-spin" />
                    <p className="text-sm text-zinc-500 font-medium">Parsing conversations...</p>
                  </>
                ) : (
                  <>
                    <Download className="w-8 h-8 mb-2 text-zinc-400" />
                    <p className="text-sm text-zinc-500 font-medium">Click to select conversations.json</p>
                  </>
                )}
              </div>
            </label>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-6 py-2 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 text-sm font-medium">
              <span>{prompts.filter(p => p.selected).length} Selected</span>
              <div className="flex gap-4">
                <button onClick={() => setPrompts(prompts.map(p => ({ ...p, selected: true })))} className="text-primary hover:underline">Select All</button>
                <button onClick={() => setPrompts(prompts.map(p => ({ ...p, selected: false })))} className="text-zinc-500 hover:underline">Deselect All</button>
              </div>
            </div>
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-3">
                {prompts.map((p) => (
                  <div 
                    key={p.id} 
                    onClick={() => toggleSelect(p.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${p.selected ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex shrink-0 h-5 w-5 rounded-full border ${p.selected ? 'border-primary bg-primary text-white' : 'border-zinc-300 dark:border-zinc-700'}`}>
                        {p.selected && <Check className="h-4 w-4 m-auto" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{p.title}</p>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{p.prompt_text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex justify-end gap-3 shrink-0">
              <Button variant="outline" onClick={() => setPrompts([])}>Reset</Button>
              <Button onClick={handleImport} disabled={isImporting || prompts.filter(p => p.selected).length === 0}>
                {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Import {prompts.filter(p => p.selected).length} Prompts
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

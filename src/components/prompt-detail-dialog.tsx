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
import { Copy, Check, MoreVertical, Edit, Trash, Loader2, Share } from 'lucide-react'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { updatePrompt, deletePrompt, createShareLink } from '@/app/actions'

interface PromptDetailDialogProps {
  children: React.ReactNode
  prompt: {
    id: string
    title: string
    prompt_text: string
    model_used?: string
    tags?: string[]
    signedUrls?: string[]
    created_at: string
    category_id?: string | null
  }
  categories?: { id: string, name: string }[]
}

export function PromptDetailDialog({ children, prompt, categories = [] }: PromptDetailDialogProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.prompt_text)
    setCopied(true)
    toast.success("Prompt copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this prompt?")) return
    const res = await deletePrompt(prompt.id)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Prompt deleted")
      setOpen(false)
    }
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const res = await updatePrompt(prompt.id, formData)
    setIsSubmitting(false)

    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Prompt updated!")
      setIsEditing(false)
    }
  }

  async function handleShare() {
    setIsSharing(true)
    const res = await createShareLink(prompt.id)
    setIsSharing(false)
    if (res?.error) {
      toast.error(res.error)
    } else if (res?.token) {
      const link = `${window.location.origin}/share/${res.token}`
      navigator.clipboard.writeText(link)
      toast.success("Public link copied to clipboard!")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="cursor-pointer group relative overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 hover:ring-2 hover:ring-primary/50 transition-all text-left block w-full">
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl p-0 md:overflow-hidden overflow-y-auto max-h-[90vh] bg-white dark:bg-zinc-950 border-0 shadow-2xl flex flex-col">
        <div className="flex flex-col md:flex-row md:h-[600px]">
          {/* Image Section */}
          <div className="w-full md:w-1/2 bg-zinc-100 dark:bg-zinc-900 relative min-h-[250px] md:min-h-0">
            {prompt.signedUrls && prompt.signedUrls.length > 0 ? (
              <div className="w-full h-full absolute inset-0 overflow-y-auto">
                <div className="flex flex-col">
                  {prompt.signedUrls.map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={url} alt={`${prompt.title || 'Prompt image'} ${i+1}`} className="w-full h-auto object-cover" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center p-8 text-zinc-400">
                No demo images provided
              </div>
            )}
          </div>
          
          {/* Details Section */}
          <div className="w-full md:w-1/2 flex flex-col h-full border-l border-zinc-200 dark:border-zinc-800">
            <DialogHeader className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <DialogTitle className="text-xl text-left">{prompt.title || 'Untitled Prompt'}</DialogTitle>
                  <DialogDescription className="mt-1 text-left">
                    {prompt.model_used && <span className="inline-block px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md text-xs mr-2">{prompt.model_used}</span>}
                    <span className="text-xs text-zinc-500">{new Date(prompt.created_at).toLocaleDateString()}</span>
                  </DialogDescription>
                </div>
                {!isEditing && (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 h-9 w-9 shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </DialogHeader>
            
            {isEditing ? (
              <form id={`edit-form-${prompt.id}`} onSubmit={handleUpdate} className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Prompt Text</label>
                      <Textarea 
                        name="prompt_text" 
                        defaultValue={prompt.prompt_text} 
                        required 
                        className="min-h-[150px]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold mb-2 block">Model Used (Optional)</label>
                        <Input name="model_used" defaultValue={prompt.model_used} />
                      </div>
                      <div>
                        <label className="text-sm font-semibold mb-2 block">Category</label>
                        <select 
                          name="category_id" 
                          defaultValue={prompt.category_id || ""}
                          className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">No Category</option>
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Tags (Optional)</label>
                      <Input name="tags" defaultValue={prompt.tags?.join(', ')} placeholder="Comma separated" />
                    </div>
                  </div>
                </div>
              </form>
            ) : (
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Prompt</h4>
                      <div className="relative group/copy">
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg text-sm leading-relaxed border border-zinc-100 dark:border-zinc-800 whitespace-pre-wrap">
                          {prompt.prompt_text}
                        </div>
                        <Button 
                          onClick={handleCopy}
                          size="icon" 
                          variant="secondary" 
                          className="absolute top-2 right-2 opacity-0 group-hover/copy:opacity-100 transition-opacity"
                        >
                          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {prompt.tags && prompt.tags.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {prompt.tags.map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
            )}
            
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/20 flex justify-end gap-2 shrink-0">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button type="submit" form={`edit-form-${prompt.id}`} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={handleShare} disabled={isSharing}>
                    {isSharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share className="h-4 w-4 mr-2" />}
                    Share
                  </Button>
                  <div className="flex-1"></div>
                  <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
                  <Button onClick={handleCopy} className="gap-2">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    Copy Prompt
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

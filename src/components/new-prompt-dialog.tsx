'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Image as ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createPrompt } from '@/app/actions'
import { createClient } from '@/utils/supabase/client'

export function NewPromptDialog({ categories = [] }: { categories?: { id: string, name: string }[] }) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fileNames, setFileNames] = useState<string[]>([])
  const [fileError, setFileError] = useState<string | null>(null)
  const [categoryId, setCategoryId] = useState<string>("")

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) {
      setFileNames([])
      setFileError(null)
      setCategoryId("")
    }
    setOpen(newOpen)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const formElement = e.currentTarget
      const formData = new FormData(formElement)
      const imageFiles = formData.getAll('images') as File[]
      
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("You must be logged in to upload images.")

      const uploadedPaths: string[] = []
      
      for (const file of imageFiles) {
        if (file && file.size > 0) {
          const fileExt = file.name.split('.').pop()
          const fileName = `${crypto.randomUUID()}.${fileExt}`
          const filePath = `${user.id}/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('prompt-images')
            .upload(filePath, file, { contentType: file.type })

          if (uploadError) throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)
          
          uploadedPaths.push(filePath)
        }
      }

      // Remove the large files from formData so we don't hit Vercel payload limits
      formData.delete('images')
      // Append the paths we just uploaded
      uploadedPaths.forEach(path => formData.append('image_paths', path))

      const res = await createPrompt(formData)
      
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success("Prompt saved!")
        setFileNames([])
        setFileError(null)
        setOpen(false)
        formElement.reset()
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 gap-2">
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">New Prompt</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col gap-0">
          <DialogHeader className="shrink-0">
            <DialogTitle>Add New Prompt</DialogTitle>
            <DialogDescription>
              Save a new prompt to your library. We'll automatically generate a title for you.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="prompt_text">Prompt Text <span className="text-red-500">*</span></Label>
              <Textarea
                id="prompt_text"
                name="prompt_text"
                placeholder="A futuristic city cyberpunk style, neon lights, 4k..."
                required
                className="min-h-[100px]"
              />
              <p className="text-[10px] text-zinc-500 mt-1">Prompt is required.</p>
            </div>
            
            <div className="grid gap-2">
              <Label>Demo Images (Optional)</Label>
              <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-zinc-50 border-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:bg-zinc-900/50 dark:border-zinc-800 relative overflow-hidden">
                  {fileNames.length > 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-4">
                      <ImageIcon className="w-8 h-8 mb-2 text-primary" />
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate w-full px-4">{fileNames.length} image(s) selected</p>
                      <p className="text-xs text-zinc-500 mt-1">Click to change</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 mb-2 text-zinc-500" />
                      <p className="mb-2 text-sm text-zinc-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    </div>
                  )}
                  <input 
                    id="dropzone-file" 
                    name="images" 
                    type="file" 
                    accept="image/*" 
                    multiple
                    className="hidden" 
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      if (files.length > 2) {
                        setFileError("You can only upload a maximum of 2 images.")
                        setFileNames([])
                        e.target.value = ''
                        return
                      }
                      
                      for (const file of files) {
                        if (file.size > 5 * 1024 * 1024) {
                          setFileError(`File ${file.name} exceeds the 5MB limit.`)
                          setFileNames([])
                          e.target.value = ''
                          return
                        }
                      }
                      
                      setFileError(null)
                      setFileNames(files.map(f => f.name))
                    }}
                  />
                </label>
              </div>
              <div className="flex justify-between items-start">
                <p className="text-[10px] text-zinc-500">Max 2 images per prompt. Max size is 5MB per image.</p>
                {fileError && <p className="text-[10px] text-red-500">{fileError}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="model_used">Model (Optional)</Label>
                <Input id="model_used" name="model_used" placeholder="e.g. Midjourney v6" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category_id">Category (Optional)</Label>
                <Select name="category_id" value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="No Category">
                      {categories.find(c => c.id === categoryId)?.name || "No Category"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Category</SelectItem>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (Optional)</Label>
              <Input id="tags" name="tags" placeholder="cyberpunk, futuristic" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Prompt
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

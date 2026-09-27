'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { deleteAccount } from '@/app/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function DeleteAccountDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsDeleting(true)
    setError('')
    const res = await deleteAccount(formData)
    setIsDeleting(false)
    
    if (res?.error) {
      setError(res.error)
    } else {
      setIsOpen(false)
      toast.success("Account deleted successfully")
      router.push('/')
      router.refresh()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">Delete Account</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>Delete Account</DialogTitle>
          </div>
          <DialogDescription className="text-zinc-600 dark:text-zinc-400">
            This action cannot be undone. This will permanently delete your account
            and remove all of your prompts and categories from our servers.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="password">Please enter your password to confirm</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              required 
            />
            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Yes, delete my account
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

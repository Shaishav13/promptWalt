'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Pencil, Key, CheckCircle2, BookMarked, Layers, Star, Menu } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { updateProfile, updatePassword } from '@/app/actions'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Props {
  initialName: string
  initialEmail: string
  memberSince: string
  totalPrompts: number
  totalFavorites: number
  totalCategories: number
  initialAvatarUrl?: string
}

export function ProfileClient({ initialName, initialEmail, memberSince, totalPrompts, totalFavorites, totalCategories, initialAvatarUrl }: Props) {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<'edit' | 'password' | null>(null)

  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState(initialEmail)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${initialEmail}`)
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  const avatarOptions = [
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
    `https://api.dicebear.com/7.x/lorelei/svg?seed=${email}`,
    `https://api.dicebear.com/7.x/micah/svg?seed=${email}`,
    `https://api.dicebear.com/7.x/notionists/svg?seed=${email}`,
    `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${email}`,
  ]

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U'

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setIsSavingProfile(true)
    const fd = new FormData()
    fd.append('name', name)
    fd.append('email', email)
    fd.append('avatar_url', avatarUrl)
    const res = await updateProfile(fd)
    setIsSavingProfile(false)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success('Profile updated successfully.')
      setActiveSection(null)
      router.refresh()
    }
  }

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    setIsSavingPassword(true)
    const fd = new FormData()
    fd.append('password', newPassword)
    const res = await updatePassword(fd)
    setIsSavingPassword(false)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success('Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setActiveSection(null)
    }
  }

  return (
    <>
      {/* Avatar + Identity */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold shrink-0 select-none overflow-hidden border-2 border-white dark:border-zinc-800 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate">{name}</p>
            <p className="text-sm text-zinc-500 truncate">{email}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              <span className="text-xs text-zinc-400">Active · Member since {memberSince}</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
                <Menu className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setActiveSection(activeSection === 'edit' ? null : 'edit')} className="cursor-pointer">
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>{activeSection === 'edit' ? 'Close Edit Profile' : 'Edit Profile'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveSection(activeSection === 'password' ? null : 'password')} className="cursor-pointer">
                  <Key className="mr-2 h-4 w-4" />
                  <span>{activeSection === 'password' ? 'Close Change Password' : 'Change Password'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      {activeSection === 'edit' && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
            Edit Profile
          </div>
          <form onSubmit={handleSaveProfile} className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Display Name</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
              <p className="text-xs text-zinc-400">If you change your email, a confirmation link will be sent to the new address.</p>
            </div>
            <div className="space-y-3 pt-2">
              <Label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Choose Avatar</Label>
              <div className="flex flex-wrap gap-3">
                {avatarOptions.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatarUrl(opt)}
                    className={`h-12 w-12 rounded-full overflow-hidden border-2 transition-all ${avatarUrl === opt ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20' : 'border-zinc-200 dark:border-zinc-700 hover:border-blue-400'}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={opt} alt={`Avatar option ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => setActiveSection(null)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={isSavingProfile}>
                {isSavingProfile && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Change Password Form */}
      {activeSection === 'password' && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
            Change Password
          </div>
          <form onSubmit={handleSavePassword} className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-password" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => setActiveSection(null)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={isSavingPassword}>
                {isSavingPassword && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                Update Password
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Prompts', value: totalPrompts, icon: BookMarked, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', href: '/' },
          { label: 'Favorites', value: totalFavorites, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-500/10', href: '/?favorites' },
          { label: 'Categories', value: totalCategories, icon: Layers, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10', href: null },
        ].map(({ label, value, icon: Icon, color, bg, href }) => {
          const card = (
            <div className={`rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 ${href ? 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer' : ''}`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg} mb-3`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{label}</p>
            </div>
          )
          return href ? <Link key={label} href={href}>{card}</Link> : <div key={label}>{card}</div>
        })}
      </div>
    </>
  )
}

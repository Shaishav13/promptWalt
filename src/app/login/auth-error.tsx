'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export function AuthError({ error }: { error?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (error) {
      toast.error(error)
      // Clear the error from the URL so reloading doesn't show it again
      const params = new URLSearchParams(searchParams.toString())
      params.delete('error')
      
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
      router.replace(newUrl, { scroll: false })
    }
  }, [error, pathname, router, searchParams])

  return null
}

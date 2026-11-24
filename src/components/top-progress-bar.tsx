'use client'

import { useEffect, useState, useTransition, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function startNavigationProgress() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app:navigation-start'))
  }
}

export function stopNavigationProgress() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app:navigation-end'))
  }
}

function ProgressBarContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  // Complete progress on route/param change
  useEffect(() => {
    if (visible) {
      setProgress(100)
      const timer = setTimeout(() => {
        setVisible(false)
        setProgress(0)
      }, 250)
      return () => clearTimeout(timer)
    }
  }, [pathname, searchParams])

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    const handleStart = () => {
      setVisible(true)
      setProgress(20)

      if (timer) clearInterval(timer)
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            if (timer) clearInterval(timer)
            return 85
          }
          // Incremental easing
          const diff = (90 - prev) * 0.15
          return prev + Math.max(diff, 2)
        })
      }, 150)
    }

    const handleEnd = () => {
      if (timer) clearInterval(timer)
      setProgress(100)
      const hideTimer = setTimeout(() => {
        setVisible(false)
        setProgress(0)
      }, 200)
      return () => clearTimeout(hideTimer)
    }

    // Intercept clicks on same-origin links
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href) return

      // Ignore external, target blank, hash-only, mailto/tel, or download links
      if (
        anchor.target === '_blank' ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        anchor.hasAttribute('download') ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey ||
        e.defaultPrevented
      ) {
        return
      }

      // Check if it's the exact same URL
      try {
        const targetUrl = new URL(anchor.href, window.location.href)
        if (targetUrl.origin === window.location.origin) {
          const currentUrl = new URL(window.location.href)
          if (targetUrl.pathname === currentUrl.pathname && targetUrl.search === currentUrl.search) {
            return
          }
          handleStart()
        }
      } catch {
        // invalid URL
      }
    }

    window.addEventListener('app:navigation-start', handleStart)
    window.addEventListener('app:navigation-end', handleEnd)
    document.addEventListener('click', handleClick, { capture: true })

    return () => {
      if (timer) clearInterval(timer)
      window.removeEventListener('app:navigation-start', handleStart)
      window.removeEventListener('app:navigation-end', handleEnd)
      document.removeEventListener('click', handleClick, { capture: true })
    }
  }, [])

  if (!visible && progress === 0) return null

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[99999] h-[2.5px] pointer-events-none overflow-hidden"
    >
      <div
        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-400 shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? '150ms' : '200ms',
          opacity: visible ? 1 : 0,
        }}
      />
    </div>
  )
}

export function TopProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBarContent />
    </Suspense>
  )
}

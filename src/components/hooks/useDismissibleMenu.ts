'use client'

import { useEffect } from 'react'

export function useDismissibleMenu(options: {
  open: boolean
  rootRef: { current: HTMLElement | null }
  onDismiss: () => void
}) {
  const { open, rootRef, onDismiss } = options

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null
      if (!target) return
      if (!rootRef.current?.contains(target)) onDismiss()
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onDismiss()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, rootRef, onDismiss])
}

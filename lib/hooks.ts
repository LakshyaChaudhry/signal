// Custom React hooks for Signal

import { useEffect, useRef } from 'react'

/**
 * Hook to detect clicks outside of a referenced element
 */
export function useClickOutside<T extends HTMLElement>(
  handler: () => void
): React.RefObject<T> {
  const ref = useRef<T>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handler])

  return ref
}

/**
 * Hook to handle keyboard shortcuts
 */
export function useKeyPress(
  targetKey: string,
  handler: () => void,
  modifiers?: {
    ctrl?: boolean
    meta?: boolean
    shift?: boolean
    alt?: boolean
  }
) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const modifiersMatch =
        (!modifiers?.ctrl || event.ctrlKey) &&
        (!modifiers?.meta || event.metaKey) &&
        (!modifiers?.shift || event.shiftKey) &&
        (!modifiers?.alt || event.altKey)

      if (event.key === targetKey && modifiersMatch) {
        event.preventDefault()
        handler()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [targetKey, handler, modifiers])
}


import { useCallback, useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react'

interface ArrowNavigationOptions {
  columns: number
  total: number
  disabled?: boolean
}

export const useArrowNavigation = ({
  columns,
  total,
  disabled,
}: ArrowNavigationOptions) => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const focusIndex = useCallback((index: number) => {
    const container = containerRef.current
    if (!container) return
    const target = container.querySelector<HTMLElement>(`[data-grid-index="${index}"]`)
    target?.focus()
  }, [])

  const computeNextIndex = useCallback(
    (current: number, key: string): number => {
      if (key === 'ArrowRight') {
        return (current + 1) % total
      }
      if (key === 'ArrowLeft') {
        return (current - 1 + total) % total
      }
      if (key === 'ArrowDown') {
        return (current + columns) % total
      }
      if (key === 'ArrowUp') {
        return (current - columns + total) % total
      }
      return current
    },
    [columns, total],
  )

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (disabled) return
      const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
      if (!keys.includes(event.key)) {
        return
      }

      const active = document.activeElement as HTMLElement | null
      const currentIndex = Number(active?.dataset.gridIndex)
      if (!Number.isFinite(currentIndex)) {
        return
      }

      event.preventDefault()
      const nextIndex = computeNextIndex(currentIndex, event.key)
      focusIndex(nextIndex)
    },
    [computeNextIndex, focusIndex, disabled],
  )

  useEffect(() => {
    if (!disabled && total > 0) {
      focusIndex(0)
    }
  }, [disabled, total, focusIndex])

  return {
    containerRef,
    handleKeyDown,
    focusIndex,
  }
}

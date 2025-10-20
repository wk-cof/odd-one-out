import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { act } from 'react'
import { App } from './App'

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders the game screen with four tiles', async () => {
    vi.useFakeTimers()
    try {
      render(<App />)
      expect(screen.getByRole('heading', { name: /odd one out/i })).toBeInTheDocument()
      expect(screen.getAllByRole('button', { name: /emoji tile/i })).toHaveLength(4)
      await act(async () => {
        vi.runOnlyPendingTimers()
      })
    } finally {
      vi.useRealTimers()
    }
  })
})

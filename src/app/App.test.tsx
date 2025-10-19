import { describe, expect, it } from 'vitest'
import { App } from './App'
import { renderWithProviders, screen } from '../test/utils'

describe('App', () => {
  it('renders the landing message', () => {
    renderWithProviders(<App />)
    expect(screen.getByRole('heading', { name: /odd one out/i })).toBeInTheDocument()
    expect(screen.getByText(/Phase 1\/10/)).toBeVisible()
  })
})

import { ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from '@mui/material'
import { theme } from '../app/theme'

export const renderWithProviders = (
  ui: ReactNode,
  options?: Omit<RenderOptions, 'queries'>,
) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>, {
    ...options,
  })

export * from '@testing-library/react'

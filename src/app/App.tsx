import { Global } from '@emotion/react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { AppLayout } from '../components/layout/AppLayout'
import { LandingMessage } from '../components/placeholders/LandingMessage'
import { globalStyles } from '../styles/global'
import { theme } from './theme'

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Global styles={globalStyles} />
      <AppLayout>
        <LandingMessage />
      </AppLayout>
    </ThemeProvider>
  )
}

export default App

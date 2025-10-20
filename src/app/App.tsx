import { Global } from '@emotion/react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { AppLayout } from '../components/layout/AppLayout'
import { globalStyles } from '../styles/global'
import { theme } from './theme'
import { GameProvider } from '../hooks/useGameController'
import { GameScreen } from '../components/game/GameScreen'

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Global styles={globalStyles} />
      <AppLayout>
        <GameProvider>
          <GameScreen />
        </GameProvider>
      </AppLayout>
    </ThemeProvider>
  )
}

export default App

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import RestartIcon from '@mui/icons-material/Replay'
import SettingsIcon from '@mui/icons-material/Tune'
import type { PatternType } from '../../game/types'
import { useGame } from '../../hooks/useGameController'
import { GameHud } from './GameHud'
import { GameBoard } from './GameBoard'
import { GameOverDialog } from './GameOverDialog'
import { SettingsPanel } from '../settings/SettingsPanel'
import { LiveRegion } from '../a11y/LiveRegion'

const patternLabels: Record<PatternType, string> = {
  category: 'Category',
  attribute: 'Attribute',
  orientation: 'Orientation',
}

const patternColors: Record<PatternType, string> = {
  category: 'primary',
  attribute: 'secondary',
  orientation: 'info',
}

export function GameScreen() {
  const { state, settings, selectTile, restart, announcement, bestScore } = useGame()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsButtonRef = useRef<HTMLButtonElement | null>(null)

  const patternTags = useMemo(
    () =>
      (Object.keys(settings.patterns) as PatternType[])
        .filter((pattern) => settings.patterns[pattern])
        .map((pattern) => ({
          key: pattern,
          label: patternLabels[pattern],
          color: patternColors[pattern],
        })),
    [settings.patterns],
  )

  const handleSelectTile = (tileId: string) => {
    if (state.status === 'running') {
      selectTile(tileId)
    }
  }

  const handleCloseSettings = () => {
    setSettingsOpen(false)
    settingsButtonRef.current?.focus()
  }

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return
      const key = event.key.toLowerCase()
      if (key === 'r') {
        event.preventDefault()
        restart()
      }
      if (key === 's') {
        event.preventDefault()
        if (settingsOpen) {
          handleCloseSettings()
        } else {
          setSettingsOpen(true)
        }
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [restart, settingsOpen, handleCloseSettings])

  return (
    <>
      <LiveRegion message={announcement} />
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Odd One Out
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Spot the rule breaker before the timer runs out.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Restart">
              <IconButton color="primary" onClick={restart}>
                <RestartIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton
                color="primary"
                onClick={() => setSettingsOpen(true)}
                ref={settingsButtonRef}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gap: { xs: 2.5, md: 3 },
            gridTemplateColumns: { xs: '1fr', md: '320px 1fr' },
            alignItems: { md: 'center' },
          }}
        >
          <Stack spacing={2} sx={{ maxWidth: { md: 320 } }}>
            <GameHud state={state} settings={settings} bestScore={bestScore} />

            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: 'rgba(12,14,19,0.8)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Stack spacing={1.25}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Typography variant="subtitle2" color="text.secondary">
                    Active patterns
                  </Typography>
                  {patternTags.map((tag) => (
                    <Chip
                      key={tag.key}
                      label={tag.label}
                      color={tag.color as any}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Stack>
                <Typography variant="body2">
                  {state.rule.description || 'Pick the odd one to keep your streak alive!'}
                </Typography>
                <Alert
                  severity={state.status === 'lost' ? 'error' : 'info'}
                  variant="outlined"
                >
                  {announcement}
                </Alert>
              </Stack>
            </Paper>
          </Stack>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                width: { xs: '100%', md: 'min(70vh, 600px)' },
                maxWidth: '640px',
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GameBoard
                tiles={state.tiles}
                disabled={state.status !== 'running'}
                revealOdd={state.status === 'lost'}
                onSelectTile={handleSelectTile}
              />
            </Box>
          </Box>
        </Box>
      </Stack>

      <SettingsPanel open={settingsOpen} onClose={handleCloseSettings} />

      <GameOverDialog state={state} open={state.status === 'lost'} onRestart={restart} />
    </>
  )
}

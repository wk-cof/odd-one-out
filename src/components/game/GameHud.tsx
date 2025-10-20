import { Box, Chip, Stack, Typography } from '@mui/material'
import type { GameState, GameSettings } from '../../game/types'

const formatTime = (ms: number): string => {
  if (!Number.isFinite(ms)) {
    return '∞'
  }

  if (ms <= 0) {
    return '0.0'
  }

  return (ms / 1000).toFixed(ms >= 1000 ? 1 : 2)
}

interface GameHudProps {
  state: GameState
  settings: GameSettings
  bestScore: number
}

export function GameHud({ state, settings, bestScore }: GameHudProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        bgcolor: 'rgba(255,255,255,0.06)',
        borderRadius: 4,
        border: '1px solid rgba(255,255,255,0.12)',
        p: 2,
      }}
    >
      <HudStat label="Round" value={state.round} accent accentLabel="Go!" testId="stat-round" />
      <HudStat label="Score" value={state.score} testId="stat-score" />
      <HudStat
        label="Best"
        value={bestScore}
        testId="stat-best"
        accent={state.score === bestScore && bestScore > 0}
        accentLabel="New"
      />
      <HudStat label="Streak" value={state.streak} testId="stat-streak" />
      <HudStat
        label="Lives"
        value={
          settings.mode === 'practice'
            ? '∞'
            : state.lives < 0
              ? 0
              : state.lives
        }
        testId="stat-lives"
      />
      <HudStat label="Time" value={`${formatTime(state.timeLeftMs)}s`} testId="stat-time" />
    </Box>
  )
}

interface HudStatProps {
  label: string
  value: string | number
  accent?: boolean
  accentLabel?: string
  testId: string
}

function HudStat({ label, value, accent, accentLabel, testId }: HudStatProps) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary" textTransform="uppercase">
        {label}
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography
          variant="h5"
          fontWeight={700}
          color={accent ? 'primary.main' : 'text.primary'}
          data-testid={testId}
        >
          {value}
        </Typography>
        {accent ? (
          <Chip
            size="small"
            label={accentLabel ?? 'Boost'}
            sx={{ bgcolor: 'rgba(108,92,231,0.15)', color: 'primary.light' }}
          />
        ) : null}
      </Stack>
    </Stack>
  )
}

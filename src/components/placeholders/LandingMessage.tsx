import { Box, Button, Stack, Typography } from '@mui/material'
import { css } from '@emotion/react'

const emojiGridStyles = css`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  font-size: clamp(2.5rem, 5vw, 4rem);
  justify-items: center;

  span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: clamp(3.25rem, 8vw, 4.5rem);
    height: clamp(3.25rem, 8vw, 4.5rem);
    border-radius: 1.25rem;
    backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.08);
  }

  span:nth-of-type(4) {
    outline: 4px solid rgba(255, 255, 255, 0.25);
  }
`

export function LandingMessage() {
  return (
    <Stack spacing={3} alignItems="center" textAlign="center">
      <Box css={emojiGridStyles} aria-hidden>
        <span role="presentation">🐼</span>
        <span role="presentation">🦊</span>
        <span role="presentation">🐯</span>
        <span role="presentation">🍎</span>
      </Box>
      <Stack spacing={1.5}>
        <Typography component="h1" variant="h4" fontWeight={800} letterSpacing="-0.04em">
          Odd One Out
        </Typography>
        <Typography variant="body1" color="text.secondary">
          A fast, friendly pattern-detection game built with React, TypeScript, and emojis
          only. Stay tuned while we assemble the game engine.
        </Typography>
      </Stack>
      <Stack spacing={1}>
        <Button
          size="large"
          variant="contained"
          disabled
          sx={{ alignSelf: 'center', px: 4 }}
        >
          Coming Soon
        </Button>
        <Typography variant="caption" color="text.secondary">
          Phase 1/10 · Scaffold, tests, and design foundations
        </Typography>
      </Stack>
    </Stack>
  )
}

export default LandingMessage

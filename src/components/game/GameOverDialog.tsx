import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import type { GameState } from '../../game/types'

interface GameOverDialogProps {
  state: GameState
  open: boolean
  onRestart: () => void
}

export function GameOverDialog({ state, open, onRestart }: GameOverDialogProps) {
  return (
    <Dialog open={open} onClose={onRestart} maxWidth="xs" fullWidth>
      <DialogTitle>Game Over</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          You reached round {state.round} with a score of {state.score}.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Keep practising to improve your streaks and reaction time!
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onRestart} variant="contained">
          Play Again
        </Button>
      </DialogActions>
    </Dialog>
  )
}

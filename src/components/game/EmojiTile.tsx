import { memo } from 'react'
import { Box, ButtonBase } from '@mui/material'
import type { TileState } from '../../game/types'

const orientationTransforms: Record<string, string> = {
  upright: 'rotate(0deg)',
  'tilt-left': 'rotate(-12deg)',
  'tilt-right': 'rotate(12deg)',
  'flip-horizontal': 'scaleX(-1)',
}

export interface EmojiTileProps {
  tile: TileState
  disabled?: boolean
  revealOdd?: boolean
  onSelect: (tileId: string) => void
  index: number
}

const EmojiTileComponent = ({ tile, disabled, revealOdd, onSelect, index }: EmojiTileProps) => (
  <ButtonBase
    data-tile-id={tile.id}
    data-odd={tile.isOdd}
    data-disabled={disabled}
    data-reveal={revealOdd}
    data-grid-index={index}
    onClick={() => onSelect(tile.id)}
    disabled={disabled}
    focusRipple
    aria-label={`Emoji tile ${tile.emoji}`}
    component="button"
    sx={{
      width: '100%',
      height: '100%',
      maxWidth: { xs: 260, sm: 320 },
      maxHeight: { xs: 260, sm: 320 },
      borderRadius: '32px',
      background: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(10px)',
      border: '2px solid rgba(255, 255, 255, 0.12)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'clamp(4rem, 10vw, 7rem)',
      transition: 'transform 160ms ease, border-color 160ms ease, background 160ms ease',
      color: 'inherit',
      position: 'relative',
      '&:hover:not([data-disabled="true"])': {
        transform: 'translateY(-4px)',
        background: 'rgba(255, 255, 255, 0.12)',
      },
      '&:focus-visible': {
        outline: 'none',
        borderColor: 'rgba(255, 255, 255, 0.6)',
        boxShadow: '0 0 0 3px rgba(108, 92, 231, 0.45)',
      },
      '&[data-disabled="true"]': {
        opacity: 0.6,
        pointerEvents: 'none',
      },
      '&[data-odd="true"]::after': {
        content: '""',
        position: 'absolute',
        inset: '8px',
        borderRadius: '22px',
        border: '2px dashed rgba(0, 184, 148, 0.0)',
        transition: 'border-color 160ms ease',
      },
      '&[data-odd="true"][data-reveal="true"]::after': {
        borderColor: 'rgba(0, 184, 148, 0.6)',
      },
    }}
  >
    <Box
      component="span"
      sx={{
        transform: orientationTransforms[tile.orientation ?? 'upright'],
        transition: 'transform 200ms ease',
      }}
    >
      {tile.emoji}
    </Box>
  </ButtonBase>
)

export const EmojiTile = memo(EmojiTileComponent)

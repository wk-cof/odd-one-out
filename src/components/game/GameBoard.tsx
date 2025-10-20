import { Box } from '@mui/material'
import type { TileState } from '../../game/types'
import { EmojiTile } from './EmojiTile'
import { useArrowNavigation } from '../../hooks/useArrowNavigation'

export interface GameBoardProps {
  tiles: TileState[]
  disabled?: boolean
  revealOdd?: boolean
  onSelectTile: (tileId: string) => void
}

export function GameBoard({ tiles, disabled, revealOdd, onSelectTile }: GameBoardProps) {
  const { containerRef, handleKeyDown } = useArrowNavigation({
    columns: 2,
    total: tiles.length,
    disabled,
  })

  return (
    <Box
      component="div"
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: { xs: 2, md: 3 },
        width: '100%',
        height: '100%',
        placeItems: 'center',
      }}
      ref={containerRef}
      onKeyDown={handleKeyDown}
      role="grid"
      aria-label="Emoji selection grid"
      aria-disabled={disabled}
    >
      {tiles.map((tile, index) => (
        <Box key={tile.id} role="presentation" sx={{ width: '100%', height: '100%' }}>
          <EmojiTile
            tile={tile}
            disabled={disabled}
            onSelect={onSelectTile}
            revealOdd={revealOdd}
            index={index}
          />
        </Box>
      ))}
    </Box>
  )
}

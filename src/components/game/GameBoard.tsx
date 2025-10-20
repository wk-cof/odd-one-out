import { Grid } from '@mui/material'
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
    <Grid
      container
      spacing={2}
      columns={2}
      justifyContent="center"
      ref={containerRef}
      onKeyDown={handleKeyDown}
      role="grid"
      aria-label="Emoji selection grid"
      aria-disabled={disabled}
    >
      {tiles.map((tile, index) => (
        <Grid item xs={1} key={tile.id} display="flex" justifyContent="center" role="presentation">
          <EmojiTile
            tile={tile}
            disabled={disabled}
            onSelect={onSelectTile}
            revealOdd={revealOdd}
            index={index}
          />
        </Grid>
      ))}
    </Grid>
  )
}

import { Box } from '@mui/material'

interface LiveRegionProps {
  message: string
}

export function LiveRegion({ message }: LiveRegionProps) {
  return (
    <Box
      component="div"
      role="status"
      aria-live="polite"
      sx={{
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {message}
    </Box>
  )
}

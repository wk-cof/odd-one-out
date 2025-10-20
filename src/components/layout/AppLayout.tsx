import type { PropsWithChildren } from 'react'
import { Box, Container, Stack } from '@mui/material'

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'center',
        py: { xs: 3, md: 4 },
        px: { xs: 2, md: 4 },
      }}
    >
      <Container maxWidth="lg">
        <Stack
          spacing={3}
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 4,
            p: { xs: 3, md: 4 },
            boxShadow: '0px 16px 36px rgba(0,0,0,0.35)',
          }}
        >
          {children}
        </Stack>
      </Container>
    </Box>
  )
}

export default AppLayout

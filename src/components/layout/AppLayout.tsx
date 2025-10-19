import { PropsWithChildren } from 'react'
import { Box, Container, Stack } from '@mui/material'

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="sm">
        <Stack
          spacing={4}
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 4,
            p: { xs: 4, md: 6 },
            boxShadow: '0px 20px 40px rgba(0,0,0,0.45)',
          }}
        >
          {children}
        </Stack>
      </Container>
    </Box>
  )
}

export default AppLayout

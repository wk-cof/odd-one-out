import { createTheme } from '@mui/material/styles'

const palette = {
  primary: {
    main: '#6C5CE7',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#00B894',
    contrastText: '#072A24',
  },
  background: {
    default: '#0E1013',
    paper: '#16181D',
  },
  text: {
    primary: '#FDFDFE',
    secondary: '#C5C8CE',
  },
}

const typography = {
  fontFamily: "'Fredoka', 'Nunito', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  body1: {
    fontSize: '1rem',
  },
  h1: {
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },
}

export const theme = createTheme({
  palette,
  typography,
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
        },
      },
    },
  },
})

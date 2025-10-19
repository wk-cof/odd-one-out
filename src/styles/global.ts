import { css } from '@emotion/react'

export const globalStyles = css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    height: 100%;
  }

  body {
    margin: 0;
    font-family: 'Fredoka', 'Nunito', system-ui, -apple-system, BlinkMacSystemFont,
      'Segoe UI', sans-serif;
    background: radial-gradient(circle at top, #111421 0%, #08090f 60%, #05060a 100%);
    color: #fdfdfe;
    -webkit-font-smoothing: antialiased;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font: inherit;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`

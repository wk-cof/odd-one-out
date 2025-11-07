import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Tune'
import type { Mode, PatternType, ThemeId } from '../../game/types'
import { useGame } from '../../hooks/gameContext'
import { THEME_LABELS } from '../../data/emojis'

const MODES: Mode[] = ['endless', 'practice', 'kid']
const PATTERNS: PatternType[] = ['category', 'attribute', 'orientation']

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { settings, setMode, togglePattern, setThemes } = useGame()

  const handleThemeToggle = (theme: ThemeId) => {
    const isActive = settings.themes.includes(theme)
    const nextThemes = isActive
      ? settings.themes.filter((item) => item !== theme)
      : [...settings.themes, theme]
    setThemes(nextThemes)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <SettingsIcon />
          <span>Settings</span>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={4}>
          <section>
            <Typography variant="overline" color="text.secondary">
              Mode
            </Typography>
            <ToggleButtonGroup
              exclusive
              value={settings.mode}
              onChange={(_, next: Mode | null) => {
                if (next) {
                  setMode(next)
                }
              }}
              sx={{
                mt: 1,
                display: 'flex',
                gap: 1,
                '& .MuiToggleButton-root': {
                  flex: 1,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  textTransform: 'capitalize',
                  color: 'text.secondary',
                  transition: 'all 0.2s ease',
                },
                '& .MuiToggleButton-root.Mui-selected': {
                  borderColor: 'primary.main',
                  color: 'primary.contrastText',
                  backgroundColor: 'primary.main',
                  boxShadow: '0 0 0 2px rgba(99,102,241,0.35)',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
                '& .MuiToggleButton-root:not(.Mui-selected):hover': {
                  backgroundColor: 'rgba(255,255,255,0.08)',
                },
              }}
            >
              {MODES.map((mode) => (
                <ToggleButton key={mode} value={mode}>
                  {mode}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </section>

          <section>
            <Typography variant="overline" color="text.secondary">
              Pattern types
            </Typography>
            <Stack spacing={1} mt={1}>
              {PATTERNS.map((pattern) => (
                <FormControlLabel
                  key={pattern}
                  control={
                    <Switch
                      checked={settings.patterns[pattern]}
                      onChange={(_, checked) => togglePattern(pattern, checked)}
                    />
                  }
                  label={pattern}
                  sx={{ textTransform: 'capitalize' }}
                />
              ))}
              <Typography variant="caption" color="text.secondary">
                At least one pattern must remain enabled.
              </Typography>
            </Stack>
          </section>

          <section>
            <Typography variant="overline" color="text.secondary">
              Themes
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                mt: 1,
              }}
            >
              {(Object.keys(THEME_LABELS) as ThemeId[]).map((theme) => {
                const active = settings.themes.includes(theme)
                const canDisable = !active || settings.themes.length > 2
                return (
                  <Button
                    key={theme}
                    variant={active ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => handleThemeToggle(theme)}
                    disabled={!canDisable}
                    sx={{
                      textTransform: 'capitalize',
                      borderRadius: 999,
                    }}
                  >
                    {THEME_LABELS[theme]}
                  </Button>
                )
              })}
            </Box>
            <Typography variant="caption" color="text.secondary" mt={1}>
              Choose at least two themes for better variety.
            </Typography>
          </section>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

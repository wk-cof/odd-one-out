import type { GameSettings, Mode } from './types'

const SETTINGS_KEY = 'ooo:lastSettings'
const BEST_SCORE_PREFIX = 'ooo:bestScore:'

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

export const loadSettings = (): Partial<GameSettings> | null => {
  if (!isBrowser()) return null
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Partial<GameSettings>
  } catch {
    return null
  }
}

export const saveSettings = (settings: GameSettings): void => {
  if (!isBrowser()) return
  try {
    const payload: Partial<GameSettings> = {
      mode: settings.mode,
      patterns: settings.patterns,
      themes: settings.themes,
      timer: settings.timer,
      lives: settings.lives,
    }
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload))
  } catch {
    // ignore
  }
}

const bestScoreKey = (mode: Mode) => `${BEST_SCORE_PREFIX}${mode}`

export const loadBestScore = (mode: Mode): number => {
  if (!isBrowser()) return 0
  const raw = window.localStorage.getItem(bestScoreKey(mode))
  const value = raw ? Number.parseInt(raw, 10) : 0
  return Number.isFinite(value) ? value : 0
}

export const saveBestScore = (mode: Mode, score: number): void => {
  if (!isBrowser()) return
  const current = loadBestScore(mode)
  if (score <= current) return
  try {
    window.localStorage.setItem(bestScoreKey(mode), String(score))
  } catch {
    // ignore
  }
}

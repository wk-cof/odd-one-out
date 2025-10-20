import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { PropsWithChildren } from 'react'
import { createSettings, createInitialState, evaluatePick, revive, tick } from '../game/engine'
import { generateRuleRound } from '../game/rules'
import { loadBestScore, loadSettings, saveBestScore, saveSettings } from '../game/storage'
import type { EngineDependencies } from '../game/engine'
import type { GameSettings, GameState, Mode, PatternType, ThemeId } from '../game/types'

type DependencyOverrides = Partial<EngineDependencies>

interface GameProviderProps extends PropsWithChildren {
  dependencies?: DependencyOverrides
  initialSettings?: Partial<GameSettings>
}

interface GameContextValue {
  state: GameState
  settings: GameSettings
  announcement: string
  bestScore: number
  selectTile: (tileId: string) => void
  restart: () => void
  setMode: (mode: Mode) => void
  togglePattern: (pattern: PatternType, enabled: boolean) => void
  setThemes: (themes: ThemeId[]) => void
}

const GameContext = createContext<GameContextValue | undefined>(undefined)

const mergeSettings = (base: GameSettings, updates: Partial<GameSettings>): GameSettings => ({
  ...base,
  ...updates,
  patterns: {
    ...base.patterns,
    ...(updates.patterns ?? {}),
  },
  themes: updates.themes ?? base.themes,
  timer: {
    ...base.timer,
    ...(updates.timer ?? {}),
  },
})

const combineDependencies = (
  overrides: DependencyOverrides | undefined,
): EngineDependencies => ({
  generateRound: overrides?.generateRound ?? generateRuleRound,
  random: overrides?.random ?? Math.random,
})

export const GameProvider = ({
  children,
  dependencies: dependencyOverrides,
  initialSettings,
}: GameProviderProps) => {
  const [settings, setSettings] = useState(() => createSettings(initialSettings))

  const engineDependencies = useMemo(
    () => combineDependencies(dependencyOverrides),
    [dependencyOverrides],
  )

  const [state, setState] = useState<GameState>(() =>
    createInitialState(settings, engineDependencies),
  )
  const [announcement, setAnnouncement] = useState('Welcome to Odd One Out!')
  const [bestScore, setBestScore] = useState(0)

  const hasInitialised = useRef(false)
  const settingsHydrated = useRef(false)

  useEffect(() => {
    const stored = loadSettings()
    if (stored) {
      setSettings(createSettings(stored))
    }
    settingsHydrated.current = true
    setBestScore(loadBestScore((stored?.mode as Mode) ?? settings.mode))
  }, [])

  useEffect(() => {
    if (hasInitialised.current) {
      setState(createInitialState(settings, engineDependencies))
    } else {
      hasInitialised.current = true
    }
  }, [settings, engineDependencies, hasInitialised])

  useEffect(() => {
    if (!settingsHydrated.current) return
    saveSettings(settings)
    setBestScore(loadBestScore(settings.mode))
  }, [settings])

  useEffect(() => {
    if (state.status !== 'running' || settings.mode === 'practice') {
      return
    }
    const interval = window.setInterval(() => {
      setState((prev) => {
        const next = tick(prev, 120, settings, engineDependencies)
        if (next.status === 'lost' && prev.status !== 'lost') {
          setAnnouncement(`Game over. Final score ${next.score}.`)
        } else if (next !== prev && next.lives < prev.lives) {
          setAnnouncement(`Time’s up! ${next.lives} lives remaining.`)
        }
        return next
      })
    }, 120)
    return () => window.clearInterval(interval)
  }, [state.status, settings, engineDependencies])

  const selectTile = useCallback(
    (tileId: string) => {
      setState((prev) => {
        const oddTileBefore = prev.tiles.find((tile) => tile.isOdd)
        const evaluation = evaluatePick(prev, tileId, settings, engineDependencies)
        if (evaluation.correct) {
          setAnnouncement(
            `Correct! Round ${evaluation.state.round}. ${evaluation.state.rule.description}`,
          )
          if (evaluation.state.score > bestScore) {
            setBestScore(evaluation.state.score)
            saveBestScore(settings.mode, evaluation.state.score)
          }
        } else if (evaluation.state.status === 'lost') {
          setAnnouncement(`No lives left. Final score ${evaluation.state.score}.`)
        } else if (settings.mode === 'practice') {
          setAnnouncement(
            oddTileBefore
              ? `${oddTileBefore.emoji} was the odd one. ${prev.rule.description}`
              : 'Not quite. Try again — consider the rule hint.',
          )
        } else {
          setAnnouncement(`Oops! ${evaluation.state.lives} lives remaining.`)
        }
        return evaluation.state
      })
    },
    [settings, engineDependencies, bestScore],
  )

  const restart = useCallback(() => {
    setState(revive(settings, engineDependencies))
    setAnnouncement(`New ${settings.mode} game. Find the odd emoji!`)
  }, [settings, engineDependencies])

  const setMode = useCallback((mode: Mode) => {
    setSettings((prev) =>
      mergeSettings(prev, {
        mode,
        lives: mode === 'kid' ? 4 : prev.lives,
        timer:
          mode === 'kid'
            ? { startTimeMs: 7000, minTimeMs: 3500, timeStepMs: 150 }
            : mode === 'practice'
              ? { startTimeMs: 6000, minTimeMs: 6000, timeStepMs: 0 }
            : { startTimeMs: 6000, minTimeMs: 2500, timeStepMs: 200 },
      }),
    )
    setAnnouncement(
      mode === 'practice'
        ? 'Practice mode enabled. Take your time and learn the rules.'
        : mode === 'kid'
          ? 'Kid mode enabled. Longer timers and gentler ramp.'
          : 'Endless mode enabled. Timers will speed up each round.',
    )
  }, [])

  const togglePattern = useCallback((pattern: PatternType, enabled: boolean) => {
    setSettings((prev) => {
      const nextPatterns = {
        ...prev.patterns,
        [pattern]: enabled,
      }
      if (!Object.values(nextPatterns).some(Boolean)) {
        return prev
      }
      return mergeSettings(prev, { patterns: nextPatterns })
    })
  }, [])

  const setThemes = useCallback((themes: ThemeId[]) => {
    setSettings((prev) => {
      if (themes.length < 2) {
        return prev
      }
      return mergeSettings(prev, { themes })
    })
  }, [])

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      settings,
      announcement,
      bestScore,
      selectTile,
      restart,
      setMode,
      togglePattern,
      setThemes,
    }),
    [
      state,
      settings,
      announcement,
      bestScore,
      selectTile,
      restart,
      setMode,
      togglePattern,
      setThemes,
    ],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export const useGame = (): GameContextValue => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

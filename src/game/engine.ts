import type {
  GameSettings,
  GameState,
  PatternType,
  RuleState,
  TileState,
  OrientationVariant,
} from './types'

export interface RoundGenerationInput {
  round: number
  settings: GameSettings
  availablePatterns: PatternType[]
  random: () => number
}

export interface RoundGenerationOutput {
  tiles: TileState[]
  rule: RuleState
  oddTileId: string
}

export interface EngineDependencies {
  generateRound: (input: RoundGenerationInput) => RoundGenerationOutput
  random?: () => number
}

export const DEFAULT_TIMER = {
  startTimeMs: 6000,
  minTimeMs: 2500,
  timeStepMs: 200,
}

export const DEFAULT_SETTINGS: GameSettings = {
  mode: 'endless',
  lives: 3,
  patterns: { category: true, attribute: true, orientation: false },
  themes: ['animals', 'food', 'nature', 'space', 'sports', 'transport', 'shapes'],
  timer: DEFAULT_TIMER,
}

const DEFAULT_DEPS: EngineDependencies = {
  generateRound() {
    throw new Error('Round generator not configured')
  },
  random: Math.random,
}

const DEFAULT_ORIENTATION: OrientationVariant = 'upright'

export const createSettings = (overrides: Partial<GameSettings> = {}): GameSettings => ({
  ...DEFAULT_SETTINGS,
  ...overrides,
  patterns: {
    ...DEFAULT_SETTINGS.patterns,
    ...(overrides.patterns ?? {}),
  },
  themes: overrides.themes ?? [...DEFAULT_SETTINGS.themes],
  timer: {
    ...DEFAULT_TIMER,
    ...(overrides.timer ?? {}),
  },
})

const listActivePatterns = (patterns: GameSettings['patterns']): PatternType[] =>
  (Object.entries(patterns) as Array<[PatternType, boolean]>)
    .filter(([, enabled]) => enabled)
    .map(([type]) => type)

const computeRoundTime = (round: number, settings: GameSettings): number => {
  if (settings.mode === 'practice' || settings.mode === 'kid') {
    return Number.POSITIVE_INFINITY
  }

  const { startTimeMs, minTimeMs, timeStepMs } = settings.timer
  const steps = Math.max(0, round - 1)
  const decrement = timeStepMs * steps
  return Math.max(minTimeMs, startTimeMs - decrement)
}

const initialiseRound = (
  round: number,
  settings: GameSettings,
  deps: EngineDependencies,
): RoundGenerationOutput => {
  const random = deps.random ?? Math.random
  const availablePatterns = listActivePatterns(settings.patterns)
  return deps.generateRound({
    round,
    settings,
    availablePatterns,
    random,
  })
}

const baseState = (settings: GameSettings): GameState => ({
  round: 1,
  score: 0,
  streak: 0,
  lives: settings.lives,
  timeLeftMs: computeRoundTime(1, settings),
  roundTimeMs: computeRoundTime(1, settings),
  tiles: [],
  rule: { type: 'category', description: '', meta: {} },
  status: 'idle',
})

export const createInitialState = (
  settings: GameSettings,
  dependencies: Partial<EngineDependencies> = {},
): GameState => {
  const mergedDeps: EngineDependencies = { ...DEFAULT_DEPS, ...dependencies }
  const nextState = baseState(settings)
  const round = initialiseRound(1, settings, mergedDeps)
  return {
    ...nextState,
    tiles: applyDefaultOrientation(round.tiles),
    rule: round.rule,
    status: 'running',
    timeLeftMs: nextState.roundTimeMs,
  }
}

const applyDefaultOrientation = (tiles: TileState[]): TileState[] =>
  tiles.map((tile) => ({
    ...tile,
    orientation: tile.orientation ?? DEFAULT_ORIENTATION,
  }))

const calculateScoreBonus = (state: GameState): number => {
  if (!Number.isFinite(state.roundTimeMs) || state.roundTimeMs === 0) {
    return 0
  }

  const speed = state.timeLeftMs / state.roundTimeMs
  if (speed >= 0.75) return 2
  if (speed >= 0.4) return 1
  return 0
}

const proceedToNextRound = (
  state: GameState,
  settings: GameSettings,
  deps: EngineDependencies,
): GameState => {
  const nextRoundNumber = state.round + 1
  const roundTimeMs = computeRoundTime(nextRoundNumber, settings)
  const round = initialiseRound(nextRoundNumber, settings, deps)
  return {
    ...state,
    round: nextRoundNumber,
    tiles: applyDefaultOrientation(round.tiles),
    rule: round.rule,
    timeLeftMs: roundTimeMs,
    roundTimeMs,
    status: 'running',
  }
}

const handleFailure = (
  state: GameState,
  settings: GameSettings,
  deps: EngineDependencies,
): GameState => {
  if (settings.mode === 'practice') {
    return proceedToNextRound(
      { ...state, streak: 0, timeLeftMs: state.roundTimeMs },
      settings,
      deps,
    )
  }

  const remainingLives = Math.max(0, state.lives - 1)
  if (remainingLives === 0) {
    return {
      ...state,
      lives: 0,
      streak: 0,
      status: 'lost',
      timeLeftMs: 0,
    }
  }

  return proceedToNextRound(
    {
      ...state,
      lives: remainingLives,
      streak: 0,
      timeLeftMs: state.roundTimeMs,
    },
    settings,
    deps,
  )
}

export const tick = (
  state: GameState,
  elapsedMs: number,
  settings: GameSettings,
  dependencies: Partial<EngineDependencies> = {},
): GameState => {
  if (state.status !== 'running' || settings.mode === 'practice' || settings.mode === 'kid') {
    return state
  }

  const mergedDeps: EngineDependencies = { ...DEFAULT_DEPS, ...dependencies }
  const timeLeft = Math.max(0, state.timeLeftMs - elapsedMs)

  if (timeLeft === 0) {
    return handleFailure({ ...state, timeLeftMs: 0 }, settings, mergedDeps)
  }

  return {
    ...state,
    timeLeftMs: timeLeft,
  }
}

export const evaluatePick = (
  state: GameState,
  tileId: string,
  settings: GameSettings,
  dependencies: Partial<EngineDependencies> = {},
): { correct: boolean; state: GameState } => {
  if (state.status !== 'running') {
    return { correct: false, state }
  }

  const mergedDeps: EngineDependencies = { ...DEFAULT_DEPS, ...dependencies }
  const pickedTile = state.tiles.find((tile) => tile.id === tileId)
  if (!pickedTile) {
    return { correct: false, state }
  }

  if (pickedTile.isOdd) {
    const bonus = calculateScoreBonus(state)
    const updatedScore = state.score + 1 + bonus
    const updatedState = proceedToNextRound(
      {
        ...state,
        score: updatedScore,
        streak: state.streak + 1,
      },
      settings,
      mergedDeps,
    )
    return { correct: true, state: updatedState }
  }

  const failedState = handleFailure(state, settings, mergedDeps)
  return { correct: false, state: failedState }
}

export const revive = (
  settings: GameSettings,
  dependencies: Partial<EngineDependencies> = {},
): GameState => createInitialState(settings, dependencies)

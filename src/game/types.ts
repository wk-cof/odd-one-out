export type Mode = 'endless' | 'practice' | 'kid'

export type PatternType = 'category' | 'attribute' | 'orientation'

export type ThemeId =
  | 'animals'
  | 'food'
  | 'nature'
  | 'space'
  | 'sports'
  | 'transport'
  | 'shapes'

export type EmojiAttribute =
  | 'round'
  | 'square-ish'
  | 'triangle-ish'
  | 'warm'
  | 'cold'
  | 'air'
  | 'water'
  | 'land'
  | 'sweet'

export type OrientationVariant = 'upright' | 'tilt-left' | 'tilt-right' | 'flip-horizontal'

export interface EmojiDescriptor {
  emoji: string
  attributes?: ReadonlyArray<EmojiAttribute>
}

export type ThemePool = Readonly<Record<ThemeId, ReadonlyArray<EmojiDescriptor>>>

export interface TimerSettings {
  startTimeMs: number
  minTimeMs: number
  timeStepMs: number
}

export interface PatternToggles {
  category: boolean
  attribute: boolean
  orientation: boolean
}

export interface GameSettings {
  mode: Mode
  lives: number
  patterns: PatternToggles
  themes: ThemeId[]
  timer: TimerSettings
}

export interface TileState {
  id: string
  emoji: string
  theme: ThemeId
  isOdd: boolean
  attributes: ReadonlyArray<EmojiAttribute>
  orientation?: OrientationVariant
}

export interface RuleState {
  type: PatternType
  description: string
  meta: Record<string, unknown>
}

export interface GameState {
  round: number
  score: number
  streak: number
  lives: number
  timeLeftMs: number
  roundTimeMs: number
  tiles: TileState[]
  rule: RuleState
  status: 'idle' | 'running' | 'won' | 'lost'
}

export interface EvaluationResult {
  correct: boolean
  nextState: GameState
}

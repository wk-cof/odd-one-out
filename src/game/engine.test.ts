import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { EngineDependencies, RoundGenerationInput, RoundGenerationOutput } from './engine'
import { createInitialState, createSettings, evaluatePick, revive, tick } from './engine'
import type { GameSettings, TileState } from './types'

const buildTiles = (oddIndex = 3): TileState[] =>
  Array.from({ length: 4 }).map((_, index) => ({
    id: `tile-${index}`,
    emoji: ['🐼', '🐻', '🐨', '🍎'][index],
    theme: index === oddIndex ? 'food' : 'animals',
    isOdd: index === oddIndex,
    attributes: [],
  }))

const mockGenerator = vi.fn<(input: RoundGenerationInput) => RoundGenerationOutput>()

const deps: EngineDependencies = {
  generateRound: (input) => mockGenerator(input),
  random: () => 0.5,
}

const defaultSettings = (): GameSettings =>
  createSettings({
    mode: 'endless',
    lives: 2,
    patterns: { category: true, attribute: false, orientation: false },
    timer: { startTimeMs: 4000, minTimeMs: 2000, timeStepMs: 500 },
  })

describe('createInitialState', () => {
  beforeEach(() => {
    mockGenerator.mockReset()
    mockGenerator.mockImplementation(() => ({
      tiles: buildTiles(),
      rule: { type: 'category', description: 'Three animals, one food', meta: {} },
      oddTileId: 'tile-3',
    }))
  })

  it('initialises a running game with generated tiles and rule', () => {
    const settings = defaultSettings()
    const state = createInitialState(settings, deps)
    expect(state.status).toBe('running')
    expect(state.tiles).toHaveLength(4)
    expect(state.rule.description).toMatch(/animals/)
    expect(state.timeLeftMs).toBe(state.roundTimeMs)
    expect(state.round).toBe(1)
  })
})

describe('tick', () => {
  beforeEach(() => {
    mockGenerator.mockReset()
    mockGenerator.mockImplementation(() => ({
      tiles: buildTiles(),
      rule: { type: 'category', description: 'Round rule', meta: {} },
      oddTileId: 'tile-3',
    }))
  })

  it('reduces the timer during endless play', () => {
    const state = createInitialState(defaultSettings(), deps)
    const next = tick(state, 1000, defaultSettings(), deps)
    expect(next.timeLeftMs).toBe(state.timeLeftMs - 1000)
  })

  it('does not change the timer during practice mode', () => {
    const practiceSettings = createSettings({ mode: 'practice' })
    const state = createInitialState(practiceSettings, deps)
    const next = tick(state, 5000, practiceSettings, deps)
    expect(next.timeLeftMs).toBe(state.timeLeftMs)
  })
})

describe('evaluatePick', () => {
  beforeEach(() => {
    mockGenerator.mockReset()
    mockGenerator
      .mockImplementationOnce(() => ({
        tiles: buildTiles(),
        rule: { type: 'category', description: 'Three animals, one food', meta: {} },
        oddTileId: 'tile-3',
      }))
      .mockImplementation(() => ({
        tiles: buildTiles(2),
        rule: { type: 'category', description: 'Three food, one animal', meta: {} },
        oddTileId: 'tile-2',
      }))
  })

  it('awards points and advances when the odd tile is selected', () => {
    const settings = defaultSettings()
    const initial = createInitialState(settings, deps)
    const { correct, state } = evaluatePick(initial, 'tile-3', settings, deps)
    expect(correct).toBe(true)
    expect(state.round).toBe(2)
    expect(state.score).toBeGreaterThan(initial.score)
    expect(state.streak).toBe(initial.streak + 1)
  })

  it('decrements lives and resets streak on incorrect selection', () => {
    const settings = defaultSettings()
    const initial = createInitialState(settings, deps)
    const result = evaluatePick(initial, 'tile-0', settings, deps)
    expect(result.correct).toBe(false)
    expect(result.state.lives).toBe(initial.lives - 1)
    expect(result.state.streak).toBe(0)
  })

  it('ends the game when lives reach zero', () => {
    const settings = createSettings({ lives: 1 })
    const initial = createInitialState(settings, deps)
    const result = evaluatePick(initial, 'tile-0', settings, deps)
    expect(result.state.status).toBe('lost')
    expect(result.state.lives).toBe(0)
  })
})

describe('revive', () => {
  beforeEach(() => {
    mockGenerator.mockReset()
    mockGenerator.mockImplementation(() => ({
      tiles: buildTiles(),
      rule: { type: 'category', description: 'rule', meta: {} },
      oddTileId: 'tile-3',
    }))
  })

  it('returns a fresh running state', () => {
    const settings = defaultSettings()
    const state = revive(settings, deps)
    expect(state.round).toBe(1)
    expect(state.score).toBe(0)
    expect(state.status).toBe('running')
  })
})

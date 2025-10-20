import { describe, expect, it } from 'vitest'
import { generateRuleRound } from './rules'
import { createSettings } from './engine'
import type { EmojiAttribute, PatternType } from './types'

const makeRandom = (...values: number[]) => {
  let index = 0
  return () => {
    const value = values[index % values.length]
    index += 1
    return value
  }
}

const buildInput = (pattern: PatternType, randomValues: number[] = []) => {
  const random = randomValues.length > 0 ? makeRandom(...randomValues) : Math.random
  const settings = createSettings({
    patterns: {
      category: true,
      attribute: true,
      orientation: true,
    },
  })
  return {
    round: 1,
    settings,
    availablePatterns: [pattern],
    random,
  }
}

describe('generateRuleRound – category', () => {
  it('returns three tiles from the same theme and one from a different theme', () => {
    const result = generateRuleRound(buildInput('category', [0.1, 0.2, 0.3, 0.8]))
    const themes = result.tiles.map((tile) => tile.theme)
    const oddTile = result.tiles.find((tile) => tile.isOdd)
    expect(oddTile).toBeDefined()
    expect(new Set(themes).size).toBeGreaterThanOrEqual(2)
    const majorityTheme = themes
      .filter((theme) => theme !== oddTile!.theme)
      .reduce<Record<string, number>>((acc, theme) => {
        acc[theme] = (acc[theme] ?? 0) + 1
        return acc
      }, {})
    expect(Object.values(majorityTheme)).toContain(3)
    expect(result.rule.type).toBe('category')
  })
})

describe('generateRuleRound – attribute', () => {
  it('returns three emojis sharing an attribute and one without', () => {
    const result = generateRuleRound(buildInput('attribute', [0.05, 0.2, 0.4, 0.6]))
    const oddTile = result.tiles.find((tile) => tile.isOdd)
    expect(oddTile).toBeDefined()
    const attribute = result.rule.meta.attribute as EmojiAttribute
    const matchingCount = result.tiles.filter((tile) =>
      tile.attributes.includes(attribute),
    ).length
    expect(matchingCount).toBe(3)
    expect(oddTile!.attributes.includes(attribute)).toBe(false)
    expect(result.rule.type).toBe('attribute')
  })
})

describe('generateRuleRound – orientation', () => {
  it('assigns a distinct orientation to the odd tile', () => {
    const input = buildInput('orientation', [0.1, 0.3, 0.5, 0.7, 0.9])
    const result = generateRuleRound(input)
    const oddTile = result.tiles.find((tile) => tile.isOdd)
    expect(oddTile).toBeDefined()
    const orientations = new Set(result.tiles.map((tile) => tile.orientation))
    expect(orientations.size).toBeGreaterThan(1)
    expect(oddTile!.orientation).toBe('upright')
    expect(result.rule.type).toBe('orientation')
    const orientationMeta = result.rule.meta.orientation as string
    const matching = result.tiles.filter(
      (tile) => tile.orientation === orientationMeta && !tile.isOdd,
    )
    expect(matching.length).toBe(3)
  })
})

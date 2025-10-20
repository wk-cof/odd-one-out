import { describe, expect, it } from 'vitest'
import {
  ALL_ATTRIBUTES,
  ALL_EMOJIS,
  ATTRIBUTE_MAP,
  EMOJI_POOLS,
  EMOJI_THEME_MAP,
  ORIENTATION_FRIENDLY_EMOJIS,
  THEME_LABELS,
} from './emojis'
import type { ThemeId } from '../game/types'

describe('EMOJI_POOLS', () => {
  it('includes all defined themes', () => {
    const themeKeys = Object.keys(EMOJI_POOLS) as ThemeId[]
    expect(new Set(themeKeys)).toEqual(new Set(Object.keys(THEME_LABELS)))
  })

  it('provides at least four emojis per theme', () => {
    Object.values(EMOJI_POOLS).forEach((pool) => {
      expect(pool.length).toBeGreaterThanOrEqual(4)
    })
  })

  it('does not duplicate emojis across themes', () => {
    const seen = new Set<string>()
    Object.values(EMOJI_POOLS).forEach((pool) => {
      pool.forEach(({ emoji }) => {
        expect(seen.has(emoji)).toBe(false)
        seen.add(emoji)
      })
    })
  })
})

describe('ALL_EMOJIS and ATTRIBUTE_MAP', () => {
  it('collects every emoji exactly once', () => {
    const flattened = Object.values(EMOJI_POOLS).flatMap((pool) =>
      pool.map(({ emoji }) => emoji),
    )
    expect(ALL_EMOJIS.length).toBe(flattened.length)
    expect(new Set(ALL_EMOJIS).size).toBe(flattened.length)
  })

  it('derives attribute lists for each emoji', () => {
    ALL_EMOJIS.forEach((emoji) => {
      expect(Array.isArray(ATTRIBUTE_MAP[emoji])).toBe(true)
      ATTRIBUTE_MAP[emoji].forEach((attr) => {
        expect(ALL_ATTRIBUTES).toContain(attr)
      })
    })
  })
})

describe('ORIENTATION_FRIENDLY_EMOJIS', () => {
  it('is a subset of all emojis', () => {
    ORIENTATION_FRIENDLY_EMOJIS.forEach((emoji) => {
      expect(ALL_EMOJIS).toContain(emoji)
    })
  })
})

describe('EMOJI_THEME_MAP', () => {
  it('maps each emoji to exactly one theme', () => {
    ALL_EMOJIS.forEach((emoji) => {
      expect(EMOJI_THEME_MAP[emoji]).toBeDefined()
    })
    expect(Object.keys(EMOJI_THEME_MAP).length).toBe(ALL_EMOJIS.length)
  })
})

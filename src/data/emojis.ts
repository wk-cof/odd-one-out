import type { EmojiAttribute, EmojiDescriptor, ThemeId, ThemePool } from '../game/types'

export const THEME_LABELS: Record<ThemeId, string> = {
  animals: 'Animals',
  food: 'Food',
  nature: 'Nature',
  space: 'Space',
  sports: 'Sports',
  transport: 'Transport',
  shapes: 'Shapes',
}

const withAttributes = (
  emoji: string,
  attributes: EmojiAttribute[] = [],
): EmojiDescriptor => ({
  emoji,
  attributes,
})

export const EMOJI_POOLS: ThemePool = {
  animals: [
    withAttributes('🐼', ['land']),
    withAttributes('🦊', ['land']),
    withAttributes('🐨', ['land']),
    withAttributes('🦁', ['land']),
    withAttributes('🐯', ['land']),
    withAttributes('🐸', ['water', 'land']),
    withAttributes('🐙', ['water']),
    withAttributes('🐢', ['water', 'land']),
    withAttributes('🐧', ['cold', 'water']),
    withAttributes('🐝', ['air', 'land']),
  ],
  food: [
    withAttributes('🍎', ['round']),
    withAttributes('🍌', ['warm']),
    withAttributes('🍓', ['round']),
    withAttributes('🍕', ['triangle-ish', 'warm']),
    withAttributes('🍔', ['warm', 'round']),
    withAttributes('🍣', ['cold']),
    withAttributes('🍩', ['round', 'sweet']),
    withAttributes('🧁', ['sweet']),
    withAttributes('🥑', ['round']),
    withAttributes('🧀', ['warm']),
  ],
  nature: [
    withAttributes('🍁'),
    withAttributes('🍄'),
    withAttributes('🌻', ['round']),
    withAttributes('🌈'),
    withAttributes('❄️', ['cold']),
    withAttributes('🌊', ['water']),
    withAttributes('⛰️', ['land']),
    withAttributes('🌵', ['warm']),
  ],
  space: [
    withAttributes('🚀', ['air']),
    withAttributes('🛰️', ['air']),
    withAttributes('🛸', ['air']),
    withAttributes('🪐', ['round']),
    withAttributes('🌟'),
    withAttributes('🌕', ['round']),
    withAttributes('🌌'),
    withAttributes('☄️'),
  ],
  sports: [
    withAttributes('⚽️', ['round']),
    withAttributes('🏀', ['round']),
    withAttributes('🏈'),
    withAttributes('🏓'),
    withAttributes('🏸'),
    withAttributes('⛳️'),
    withAttributes('🥅'),
    withAttributes('🥊'),
  ],
  transport: [
    withAttributes('🚗', ['land']),
    withAttributes('🚌', ['land']),
    withAttributes('🚲', ['land']),
    withAttributes('🚂', ['land']),
    withAttributes('🚁', ['air']),
    withAttributes('✈️', ['air']),
    withAttributes('🚇', ['land']),
    withAttributes('🚜', ['land']),
  ],
  shapes: [
    withAttributes('🔵', ['round']),
    withAttributes('🔺', ['triangle-ish']),
    withAttributes('⬛️', ['square-ish']),
    withAttributes('⭐️', ['round']),
    withAttributes('🟩', ['square-ish']),
    withAttributes('🟥', ['square-ish']),
    withAttributes('🟨', ['square-ish']),
    withAttributes('🟪', ['square-ish']),
  ],
}

const attributeSet = new Set<EmojiAttribute>()

Object.values(EMOJI_POOLS).forEach((pool) =>
  pool.forEach((entry) => entry.attributes?.forEach((attr) => attributeSet.add(attr))),
)

export const ALL_ATTRIBUTES = Array.from(attributeSet).sort()

export const ALL_EMOJIS = Object.values(EMOJI_POOLS)
  .flatMap((pool) => pool.map((entry) => entry.emoji))
  .sort()

export const ORIENTATION_FRIENDLY_EMOJIS = new Set<string>([
  '🐢',
  '🐸',
  '🐙',
  '🚀',
  '🛰️',
  '🛸',
  '⚽️',
  '🏀',
  '🏈',
  '🚗',
  '✈️',
  '🚁',
  '🍕',
  '🍩',
  '🔺',
  '🔵',
  '🟨',
  '🟩',
  '🟥',
  '🟪',
  '⬛️',
  '⭐️',
])

export const ATTRIBUTE_MAP: Record<string, ReadonlyArray<EmojiAttribute>> = ALL_EMOJIS.reduce<
  Record<string, ReadonlyArray<EmojiAttribute>>
>((acc, emoji) => {
  const descriptor = Object.values(EMOJI_POOLS)
    .flat()
    .find((entry) => entry.emoji === emoji)
  acc[emoji] = descriptor?.attributes ?? []
  return acc
}, {})

export const EMOJI_THEME_MAP: Record<string, ThemeId> = Object.entries(EMOJI_POOLS).reduce<
  Record<string, ThemeId>
>((acc, [theme, pool]) => {
  pool.forEach((entry) => {
    acc[entry.emoji] = theme as ThemeId
  })
  return acc
}, {})

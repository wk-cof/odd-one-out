import {
  ATTRIBUTE_MAP,
  EMOJI_POOLS,
  EMOJI_THEME_MAP,
  ORIENTATION_FRIENDLY_EMOJIS,
  THEME_LABELS,
} from '../data/emojis'
import type {
  OrientationVariant,
  PatternType,
  ThemeId,
  TileState,
  EmojiAttribute,
} from './types'
import type {
  EngineDependencies,
  RoundGenerationInput,
  RoundGenerationOutput,
} from './engine'

type EmojiPick = {
  emoji: string
  theme: ThemeId
}

const ORIENTATION_MATCH_VARIANTS: OrientationVariant[] = [
  'tilt-left',
  'tilt-right',
  'flip-horizontal',
]

const pickRandom = <T>(values: readonly T[], random: () => number): T => {
  if (values.length === 0) {
    throw new Error('Cannot pick from an empty list')
  }
  const index = Math.floor(random() * values.length)
  return values[Math.min(index, values.length - 1)]
}

const sampleUnique = <T>(values: readonly T[], random: () => number, count: number): T[] => {
  if (count > values.length) {
    throw new Error('Cannot sample more values than are available')
  }
  const pool = [...values]
  const picks: T[] = []
  while (picks.length < count) {
    const choice = pickRandom(pool, random)
    picks.push(choice)
    pool.splice(pool.indexOf(choice), 1)
  }
  return picks
}

const shuffle = <T>(values: readonly T[], random: () => number): T[] => {
  const arr = [...values]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const getThemeEmojis = (theme: ThemeId): EmojiPick[] =>
  EMOJI_POOLS[theme].map((entry) => ({
    emoji: entry.emoji,
    theme,
  }))

const attributeMatches = (attribute: EmojiAttribute): EmojiPick[] =>
  Object.entries(ATTRIBUTE_MAP)
    .filter(([, attrs]) => attrs.includes(attribute))
    .map(([emoji]) => ({
      emoji,
      theme: EMOJI_THEME_MAP[emoji],
    }))

const attributeNonMatches = (attribute: EmojiAttribute, themes: ThemeId[]): EmojiPick[] =>
  themes
    .flatMap((theme) => getThemeEmojis(theme))
    .filter((pick) => !(ATTRIBUTE_MAP[pick.emoji] ?? []).includes(attribute))

const toTile = (
  pick: EmojiPick,
  round: number,
  index: number,
  isOdd: boolean,
  orientation: OrientationVariant = 'upright',
): TileState => ({
  id: `r${round}-t${index}-${pick.emoji}`,
  emoji: pick.emoji,
  theme: pick.theme,
  isOdd,
  attributes: ATTRIBUTE_MAP[pick.emoji] ?? [],
  orientation,
})

const allAttributes = Array.from(
  new Set(
    Object.values(ATTRIBUTE_MAP).flatMap((attrs) => attrs),
  ),
) as EmojiAttribute[]

const attributeCandidates = (themes: ThemeId[]): EmojiAttribute[] =>
  allAttributes.filter(
    (attr) =>
      attributeMatches(attr).length >= 3 && attributeNonMatches(attr, themes).length > 0,
  )

const patternEligible = {
  category: (themes: ThemeId[]): boolean =>
    themes.filter((theme) => getThemeEmojis(theme).length >= 3).length >= 2,
  attribute: (themes: ThemeId[]): boolean => attributeCandidates(themes).length > 0,
  orientation: (themes: ThemeId[]): boolean =>
    themes.some((theme) => getOrientationFriendly(theme).length >= 4),
} as const

const getOrientationFriendly = (theme: ThemeId): EmojiPick[] =>
  getThemeEmojis(theme).filter((pick) => ORIENTATION_FRIENDLY_EMOJIS.has(pick.emoji))

const choosePattern = (
  input: RoundGenerationInput,
  random: () => number,
): PatternType => {
  const eligible = input.availablePatterns.filter((pattern) =>
    patternEligible[pattern](input.settings.themes),
  )
  if (eligible.length === 0) {
    return 'category'
  }
  return pickRandom(eligible, random)
}

const categoryRound = (
  input: RoundGenerationInput,
  random: () => number,
): RoundGenerationOutput => {
  const baseTheme = pickRandom(
    input.settings.themes.filter((theme) => getThemeEmojis(theme).length >= 3),
    random,
  )
  const oddTheme = pickRandom(
    input.settings.themes.filter((theme) => theme !== baseTheme),
    random,
  )

  const matchPicks = sampleUnique(getThemeEmojis(baseTheme), random, 3)
  const oddPick = pickRandom(getThemeEmojis(oddTheme), random)

  const tiles = shuffle(
    [...matchPicks.map((pick, index) => toTile(pick, input.round, index, false)), toTile(oddPick, input.round, 3, true)],
    random,
  )

  const oddTile = tiles.find((tile) => tile.isOdd)
  if (!oddTile) {
    throw new Error('Failed to determine odd tile for category round')
  }

  return {
    tiles,
    oddTileId: oddTile.id,
    rule: {
      type: 'category',
      description: `Three ${THEME_LABELS[baseTheme]}, one ${THEME_LABELS[oddTheme]}`,
      meta: { baseTheme, oddTheme },
    },
  }
}

const attributeRound = (
  input: RoundGenerationInput,
  random: () => number,
): RoundGenerationOutput => {
  const candidates = attributeCandidates(input.settings.themes)
  if (candidates.length === 0) {
    throw new Error('Attribute round requested without sufficient attributes')
  }
  const attribute = pickRandom(candidates, random)
  const matches = attributeMatches(attribute)
  const nonMatches = attributeNonMatches(attribute, input.settings.themes)
  if (nonMatches.length === 0) {
    throw new Error(`No non-matching emoji found for attribute ${attribute}`)
  }
  const matchPicks = sampleUnique(matches, random, 3)
  const oddPick = pickRandom(nonMatches, random)

  const tiles = shuffle(
    [
      ...matchPicks.map((pick, index) => toTile(pick, input.round, index, false)),
      toTile(oddPick, input.round, 3, true),
    ],
    random,
  )

  const oddTile = tiles.find((tile) => tile.isOdd)
  if (!oddTile) {
    throw new Error('Failed to determine odd tile for attribute round')
  }

  return {
    tiles,
    oddTileId: oddTile.id,
    rule: {
      type: 'attribute',
      description: `Three emojis share attribute “${attribute}”`,
      meta: { attribute },
    },
  }
}

const orientationRound = (
  input: RoundGenerationInput,
  random: () => number,
): RoundGenerationOutput => {
  const themeCandidates = input.settings.themes.filter(
    (theme) => getOrientationFriendly(theme).length >= 4,
  )
  if (themeCandidates.length === 0) {
    throw new Error('Orientation round requested without suitable themes')
  }

  const theme = pickRandom(themeCandidates, random)
  const picks = sampleUnique(getOrientationFriendly(theme), random, 4)
  const oddIndex = Math.floor(random() * picks.length)
  const matchOrientation = pickRandom(ORIENTATION_MATCH_VARIANTS, random)

  const tiles = shuffle(
    picks.map((pick, index) =>
      toTile(
        pick,
        input.round,
        index,
        index === oddIndex,
        index === oddIndex ? 'upright' : matchOrientation,
      ),
    ),
    random,
  )

  const oddTile = tiles.find((tile) => tile.isOdd)
  if (!oddTile) {
    throw new Error('Failed to determine odd tile for orientation round')
  }

  return {
    tiles,
    oddTileId: oddTile.id,
    rule: {
      type: 'orientation',
      description: 'One emoji faces differently than the others',
      meta: {
        theme,
        orientation: matchOrientation,
      },
    },
  }
}

export const generateRuleRound = (
  input: RoundGenerationInput,
): RoundGenerationOutput => {
  const random = input.random ?? Math.random
  const pattern = choosePattern(input, random)

  switch (pattern) {
    case 'category':
      return categoryRound(input, random)
    case 'attribute':
      return attributeRound(input, random)
    case 'orientation':
      return orientationRound(input, random)
    default:
      return categoryRound(input, random)
  }
}

export const RULE_ENGINE_DEPENDENCIES: EngineDependencies = {
  generateRound: generateRuleRound,
  random: Math.random,
}

import { beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test/utils';
import { GameProvider } from '../../hooks/useGameController';
import { GameScreen } from './GameScreen';
import type { RoundGenerationOutput } from '../../game/engine';
import type { TileState } from '../../game/types';

const createTile = (id: string, emoji: string, theme: TileState['theme'], isOdd = false) => ({
  id,
  emoji,
  theme,
  isOdd,
  attributes: [],
  orientation: 'upright' as const,
});

const rounds: RoundGenerationOutput[] = [
  {
    tiles: [
      createTile('tile-0', '🐼', 'animals'),
      createTile('tile-1', '🦊', 'animals'),
      createTile('tile-2', '🐯', 'animals'),
      createTile('tile-3', '🍎', 'food', true),
    ],
    rule: {
      type: 'category',
      description: 'Three animals, one food',
      meta: {},
    },
    oddTileId: 'tile-3',
  },
  {
    tiles: [
      createTile('tile-0', '🍩', 'food'),
      createTile('tile-1', '🍪', 'food'),
      createTile('tile-2', '🍰', 'food', true),
      createTile('tile-3', '🍎', 'food'),
    ],
    rule: {
      type: 'attribute',
      description: 'Three sweets, one fruit',
      meta: {},
    },
    oddTileId: 'tile-2',
  },
];

describe('GameScreen', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('advances score when selecting the odd tile', async () => {
    const user = userEvent.setup();
    const generateRound = vi
      .fn()
      .mockImplementationOnce(() => rounds[0])
      .mockImplementationOnce(() => rounds[1])
      .mockImplementation(() => rounds[1]);

    renderWithProviders(
      <GameProvider dependencies={{ generateRound, random: () => 0.1 }}>
        <GameScreen />
      </GameProvider>,
    );

    expect(generateRound).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('stat-score')).toHaveTextContent('0');

    await user.click(screen.getByRole('button', { name: /🍎/ }));

    expect(screen.getByTestId('stat-score')).not.toHaveTextContent('0');
    expect(generateRound).toHaveBeenCalledTimes(2);
    expect(Number(screen.getByTestId('stat-best').textContent ?? '0')).toBeGreaterThan(0);
    expect(Number(window.localStorage.getItem('ooo:bestScore:endless') ?? '0')).toBeGreaterThan(0);
  });
});

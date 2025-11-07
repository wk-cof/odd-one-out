import { createContext, useContext } from 'react';
import type { GameSettings, GameState, Mode, PatternType, ThemeId } from '../game/types';

export interface GameContextValue {
  state: GameState;
  settings: GameSettings;
  announcement: string;
  bestScore: number;
  selectTile: (tileId: string) => void;
  restart: () => void;
  setMode: (mode: Mode) => void;
  togglePattern: (pattern: PatternType, enabled: boolean) => void;
  setThemes: (themes: ThemeId[]) => void;
}

export const GameContext = createContext<GameContextValue | undefined>(undefined);

export const useGame = (): GameContextValue => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

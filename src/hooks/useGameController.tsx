import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
  DEFAULT_SETTINGS,
  createSettings,
  createInitialState,
  evaluatePick,
  revive,
  tick,
} from '../game/engine';
import { generateRuleRound } from '../game/rules';
import { loadBestScore, loadSettings, saveBestScore, saveSettings } from '../game/storage';
import type { EngineDependencies } from '../game/engine';
import type { GameSettings, GameState, Mode, PatternType, ThemeId } from '../game/types';
import { GameContext, type GameContextValue } from './gameContext';

type DependencyOverrides = Partial<EngineDependencies>;

const KID_DEFAULTS: Partial<GameSettings> = {
  mode: 'kid',
  lives: 4,
  patterns: { category: true, attribute: false, orientation: false },
  timer: { startTimeMs: 6000, minTimeMs: 6000, timeStepMs: 0 },
};

const NON_KID_PATTERNS: GameSettings['patterns'] = {
  ...DEFAULT_SETTINGS.patterns,
};

interface GameProviderProps extends PropsWithChildren {
  dependencies?: DependencyOverrides;
  initialSettings?: Partial<GameSettings>;
}

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
});

const combineDependencies = (overrides: DependencyOverrides | undefined): EngineDependencies => ({
  generateRound: overrides?.generateRound ?? generateRuleRound,
  random: overrides?.random ?? Math.random,
});

export const GameProvider = ({
  children,
  dependencies: dependencyOverrides,
  initialSettings,
}: GameProviderProps) => {
  const initialSettingsRef = useRef<GameSettings | null>(null);
  if (!initialSettingsRef.current) {
    initialSettingsRef.current = createSettings(initialSettings ?? KID_DEFAULTS);
  }
  const [settings, setSettings] = useState<GameSettings>(() => initialSettingsRef.current!);
  const lastNonKidPatterns = useRef<GameSettings['patterns']>(
    initialSettingsRef.current.mode === 'kid'
      ? { ...NON_KID_PATTERNS }
      : initialSettingsRef.current.patterns,
  );

  const engineDependencies = useMemo(
    () => combineDependencies(dependencyOverrides),
    [dependencyOverrides],
  );

  const [state, setState] = useState<GameState>(() =>
    createInitialState(settings, engineDependencies),
  );
  const [announcement, setAnnouncement] = useState('Welcome to Odd One Out!');
  const [bestScore, setBestScore] = useState(0);

  const hasInitialised = useRef(false);
  const settingsHydrated = useRef(false);

  useEffect(() => {
    const stored = loadSettings();
    if (stored) {
      setSettings(createSettings(stored));
    }
    settingsHydrated.current = true;
    const initialMode = initialSettingsRef.current?.mode ?? 'endless';
    setBestScore(loadBestScore((stored?.mode as Mode) ?? initialMode));
  }, []);

  useEffect(() => {
    if (hasInitialised.current) {
      setState(createInitialState(settings, engineDependencies));
    } else {
      hasInitialised.current = true;
    }
  }, [settings, engineDependencies, hasInitialised]);

  useEffect(() => {
    if (!settingsHydrated.current) return;
    saveSettings(settings);
    setBestScore(loadBestScore(settings.mode));
  }, [settings]);

  useEffect(() => {
    if (settings.mode !== 'kid') {
      lastNonKidPatterns.current = settings.patterns;
    }
  }, [settings.mode, settings.patterns]);

  useEffect(() => {
    if (state.status !== 'running' || settings.mode === 'practice' || settings.mode === 'kid') {
      return;
    }
    const interval = window.setInterval(() => {
      setState((prev) => {
        const next = tick(prev, 120, settings, engineDependencies);
        if (next.status === 'lost' && prev.status !== 'lost') {
          setAnnouncement(`Game over. Final score ${next.score}.`);
        } else if (next !== prev && next.lives < prev.lives) {
          setAnnouncement(`Time’s up! ${next.lives} lives remaining.`);
        }
        return next;
      });
    }, 120);
    return () => window.clearInterval(interval);
  }, [state.status, settings, engineDependencies]);

  const selectTile = useCallback(
    (tileId: string) => {
      setState((prev) => {
        const oddTileBefore = prev.tiles.find((tile) => tile.isOdd);
        const evaluation = evaluatePick(prev, tileId, settings, engineDependencies);
        if (evaluation.correct) {
          setAnnouncement(
            `Correct! Round ${evaluation.state.round}. ${evaluation.state.rule.description}`,
          );
          if (evaluation.state.score > bestScore) {
            setBestScore(evaluation.state.score);
            saveBestScore(settings.mode, evaluation.state.score);
          }
        } else if (evaluation.state.status === 'lost') {
          setAnnouncement(`No lives left. Final score ${evaluation.state.score}.`);
        } else if (settings.mode === 'practice') {
          setAnnouncement(
            oddTileBefore
              ? `${oddTileBefore.emoji} was the odd one. ${prev.rule.description}`
              : 'Not quite. Try again — consider the rule hint.',
          );
        } else {
          setAnnouncement(`Oops! ${evaluation.state.lives} lives remaining.`);
        }
        return evaluation.state;
      });
    },
    [settings, engineDependencies, bestScore],
  );

  const restart = useCallback(() => {
    setState(revive(settings, engineDependencies));
    setAnnouncement(`New ${settings.mode} game. Find the odd emoji!`);
  }, [settings, engineDependencies]);

  const setMode = useCallback((mode: Mode) => {
    setSettings((prev) => {
      if (mode === 'kid' && prev.mode !== 'kid') {
        lastNonKidPatterns.current = prev.patterns;
      }
      const updates: Partial<GameSettings> = {
        mode,
        lives: mode === 'kid' ? 4 : prev.lives,
        timer:
          mode === 'practice' || mode === 'kid'
            ? { startTimeMs: 6000, minTimeMs: 6000, timeStepMs: 0 }
            : { startTimeMs: 6000, minTimeMs: 2500, timeStepMs: 200 },
      };

      if (mode === 'kid') {
        updates.patterns = { category: true, attribute: false, orientation: false };
      } else if (prev.mode === 'kid') {
        updates.patterns = lastNonKidPatterns.current;
      }

      return mergeSettings(prev, updates);
    });
    setAnnouncement(
      mode === 'practice'
        ? 'Practice mode enabled. Take your time and learn the rules.'
        : mode === 'kid'
          ? 'Kid mode enabled. No countdowns and friendlier puzzles.'
          : 'Endless mode enabled. Timers will speed up each round.',
    );
  }, []);

  const togglePattern = useCallback((pattern: PatternType, enabled: boolean) => {
    setSettings((prev) => {
      if (prev.mode === 'kid' && pattern !== 'category' && enabled) {
        return prev;
      }

      const nextPatterns = {
        ...prev.patterns,
        [pattern]: enabled,
      };
      if (!Object.values(nextPatterns).some(Boolean)) {
        return prev;
      }
      return mergeSettings(prev, { patterns: nextPatterns });
    });
  }, []);

  const setThemes = useCallback((themes: ThemeId[]) => {
    setSettings((prev) => {
      if (themes.length < 2) {
        return prev;
      }
      return mergeSettings(prev, { themes });
    });
  }, []);

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
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

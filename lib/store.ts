import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Board } from './sudoku';

export type Difficulty = 'very_easy' | 'easy' | 'medium' | 'hard';
export type GameMode = 'numbers' | 'colors';

export type Cell = {
  value: number | null;
  isGiven: boolean;
  isError: boolean;
};

export interface SavedGame {
  level: number;
  board: Cell[][];
  solution: Board;
  history: { r: number; c: number; prev: number | null }[];
  mistakes: number;
}

export interface GameState {
  playerName: string;
  mascotId: string;
  completedGames: number;
  gameMode: GameMode;
  currentGame: SavedGame | null;
  setPlayerInfo: (name: string, mascotId: string) => void;
  setGameMode: (mode: GameMode) => void;
  incrementCompletedGames: () => void;
  saveCurrentGame: (game: SavedGame) => void;
  clearCurrentGame: () => void;
  resetProgress: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      playerName: '',
      mascotId: '',
      completedGames: 0,
      gameMode: 'numbers',
      currentGame: null,
      setPlayerInfo: (name, mascotId) => set({ playerName: name, mascotId }),
      setGameMode: (mode) => set({ gameMode: mode }),
      incrementCompletedGames: () => set((state) => ({ completedGames: state.completedGames + 1 })),
      saveCurrentGame: (game) => set({ currentGame: game }),
      clearCurrentGame: () => set({ currentGame: null }),
      resetProgress: () => set({ playerName: '', mascotId: '', completedGames: 0, currentGame: null }),
    }),
    {
      name: 'sudoku-kids-storage',
    }
  )
);

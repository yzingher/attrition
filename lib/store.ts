import { create } from 'zustand'

export type GamePhase = 'title' | 'faction-select' | 'briefing' | 'peacetime' | 'combat' | 'post-match'

export type FactionId = 'usa' | 'china' | 'russia' | 'ukraine' | 'iran' | 'taiwan'

export interface PlayerState {
  faction: FactionId | null
}

export interface GameState {
  phase: GamePhase
  player1: PlayerState
  player2: PlayerState
  matchClock: number // seconds elapsed
  isPaused: boolean

  // Actions
  setPhase: (phase: GamePhase) => void
  selectFaction: (player: 1 | 2, faction: FactionId) => void
  startMatch: () => void
  endMatch: () => void
  togglePause: () => void
  reset: () => void
}

export const useGameStore = create<GameState>((set) => ({
  phase: 'title',
  player1: { faction: null },
  player2: { faction: null },
  matchClock: 0,
  isPaused: false,

  setPhase: (phase) => set({ phase }),

  selectFaction: (player, faction) =>
    set((state) => ({
      [player === 1 ? 'player1' : 'player2']: { ...state[player === 1 ? 'player1' : 'player2'], faction },
    })),

  startMatch: () => set({ phase: 'briefing', matchClock: 0 }),

  endMatch: () => set({ phase: 'post-match' }),

  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),

  reset: () =>
    set({
      phase: 'title',
      player1: { faction: null },
      player2: { faction: null },
      matchClock: 0,
      isPaused: false,
    }),
}))

import { create } from 'zustand'
import { PlayerEconomy, NodeType } from '@/game/sim/types'
import { createInitialEconomy, tickEconomy, buildNode, getEffectiveRegenRate } from '@/game/sim/economy'

export type GamePhase = 'title' | 'faction-select' | 'briefing' | 'peacetime' | 'combat' | 'post-match'

export type FactionId = 'usa' | 'china' | 'russia' | 'ukraine' | 'iran' | 'taiwan'

export interface PlayerState {
  faction: FactionId | null
  economy: PlayerEconomy | null
}

export interface GameState {
  phase: GamePhase
  player1: PlayerState
  player2: PlayerState
  matchClock: number
  isPaused: boolean

  // Actions
  setPhase: (phase: GamePhase) => void
  selectFaction: (player: 1 | 2, faction: FactionId) => void
  startMatch: () => void
  endMatch: () => void
  togglePause: () => void
  reset: () => void
  tick: () => void
  buildNode: (player: 1 | 2, type: NodeType, dispersed: boolean) => void
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'title',
  player1: { faction: null, economy: null },
  player2: { faction: null, economy: null },
  matchClock: 0,
  isPaused: false,

  setPhase: (phase) => set({ phase }),

  selectFaction: (player, faction) =>
    set((state) => ({
      [player === 1 ? 'player1' : 'player2']: {
        ...state[player === 1 ? 'player1' : 'player2'],
        faction,
      },
    })),

  startMatch: () =>
    set({
      phase: 'briefing',
      matchClock: 0,
      player1: {
        ...get().player1,
        economy: createInitialEconomy(false),
      },
      player2: {
        ...get().player2,
        economy: createInitialEconomy(false),
      },
    }),

  endMatch: () => set({ phase: 'post-match' }),

  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),

  reset: () =>
    set({
      phase: 'title',
      player1: { faction: null, economy: null },
      player2: { faction: null, economy: null },
      matchClock: 0,
      isPaused: false,
    }),

  tick: () =>
    set((state) => {
      const newClock = state.matchClock + 1

      // Tick economies
      const p1Econ = state.player1.economy ? tickEconomy(state.player1.economy, newClock) : null
      const p2Econ = state.player2.economy ? tickEconomy(state.player2.economy, newClock) : null

      // Phase transitions
      let newPhase = state.phase
      if (state.phase === 'peacetime' && newClock >= 210) {
        newPhase = 'combat'
      }
      if (newClock >= 1200) {
        newPhase = 'post-match'
      }

      // Check production collapse victory (only in combat phase)
      if (newPhase === 'combat' && p1Econ && p2Econ) {
        const p1StartingRate = p1Econ.peakProductionRate || 1
        const p2StartingRate = p2Econ.peakProductionRate || 1
        const p1CurrentRate = getEffectiveRegenRate(p1Econ)
        const p2CurrentRate = getEffectiveRegenRate(p2Econ)

        if (p1CurrentRate / p1StartingRate < 0.2 || p2CurrentRate / p2StartingRate < 0.2) {
          newPhase = 'post-match'
        }
      }

      return {
        matchClock: newClock,
        phase: newPhase,
        player1: { ...state.player1, economy: p1Econ },
        player2: { ...state.player2, economy: p2Econ },
      }
    }),

  buildNode: (player, type, dispersed) =>
    set((state) => {
      const key = player === 1 ? 'player1' : 'player2'
      const playerState = state[key]
      if (!playerState.economy) return state

      const result = buildNode(playerState.economy, type, dispersed)
      if (!result) return state

      return {
        [key]: { ...playerState, economy: result },
      }
    }),
}))

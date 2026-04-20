import { create } from 'zustand'
import { PlayerEconomy, NodeType } from '@/game/sim/types'
import { createInitialEconomy, tickEconomy, buildNode, getEffectiveRegenRate } from '@/game/sim/economy'
import { RealtimeChannel } from '@supabase/supabase-js'
import { RoomRole, RoomMessage, sendMessage } from './room'

export type GamePhase = 'lobby' | 'faction-select' | 'briefing' | 'peacetime' | 'combat' | 'post-match'
export type FactionId = 'usa' | 'china' | 'russia' | 'ukraine' | 'iran' | 'taiwan'

export interface PlayerState {
  faction: FactionId | null
  economy: PlayerEconomy | null
  connected: boolean
  ready: boolean
}

export interface GameState {
  // Room
  roomId: string | null
  role: RoomRole | null
  channel: RealtimeChannel | null

  // Game
  phase: GamePhase
  player1: PlayerState
  player2: PlayerState
  matchClock: number
  isPaused: boolean

  // Actions
  setRoom: (roomId: string, role: RoomRole, channel: RealtimeChannel) => void
  setPhase: (phase: GamePhase) => void
  setPlayerConnected: (player: 1 | 2, connected: boolean) => void
  setPlayerReady: (player: 1 | 2, ready: boolean) => void
  selectFaction: (player: 1 | 2, faction: FactionId) => void
  startMatch: () => void
  endMatch: () => void
  togglePause: () => void
  reset: () => void
  tick: () => void
  buildNode: (player: 1 | 2, type: NodeType, dispersed: boolean) => void
  handleMessage: (msg: RoomMessage) => void
  syncState: () => void
}

const emptyPlayer: PlayerState = { faction: null, economy: null, connected: false, ready: false }

export const useGameStore = create<GameState>((set, get) => ({
  roomId: null,
  role: null,
  channel: null,

  phase: 'lobby',
  player1: { ...emptyPlayer },
  player2: { ...emptyPlayer },
  matchClock: 0,
  isPaused: false,

  setRoom: (roomId, role, channel) => set({ roomId, role, channel }),

  setPhase: (phase) => {
    set({ phase })
    const { channel, role } = get()
    if (channel && role === 'display') {
      sendMessage(channel, 'phase_change', { phase }, 'display')
    }
  },

  setPlayerConnected: (player, connected) =>
    set((s) => ({
      [player === 1 ? 'player1' : 'player2']: {
        ...s[player === 1 ? 'player1' : 'player2'],
        connected,
      },
    })),

  setPlayerReady: (player, ready) =>
    set((s) => ({
      [player === 1 ? 'player1' : 'player2']: {
        ...s[player === 1 ? 'player1' : 'player2'],
        ready,
      },
    })),

  selectFaction: (player, faction) => {
    set((s) => ({
      [player === 1 ? 'player1' : 'player2']: {
        ...s[player === 1 ? 'player1' : 'player2'],
        faction,
      },
    }))
    const { channel, role } = get()
    if (channel) {
      sendMessage(channel, 'faction_selected', { player, faction }, role || 'display')
    }
  },

  startMatch: () => {
    set({
      phase: 'briefing',
      matchClock: 0,
      player1: { ...get().player1, economy: createInitialEconomy(false) },
      player2: { ...get().player2, economy: createInitialEconomy(false) },
    })
    const { channel } = get()
    if (channel) {
      sendMessage(channel, 'game_start', {}, 'display')
    }
  },

  endMatch: () => set({ phase: 'post-match' }),

  togglePause: () => {
    const newPaused = !get().isPaused
    set({ isPaused: newPaused })
    const { channel, role } = get()
    if (channel) {
      sendMessage(channel, newPaused ? 'pause' : 'resume', {}, role || 'display')
    }
  },

  reset: () =>
    set({
      phase: 'lobby',
      player1: { ...emptyPlayer },
      player2: { ...emptyPlayer },
      matchClock: 0,
      isPaused: false,
    }),

  tick: () =>
    set((state) => {
      const newClock = state.matchClock + 1
      const p1Econ = state.player1.economy ? tickEconomy(state.player1.economy, newClock) : null
      const p2Econ = state.player2.economy ? tickEconomy(state.player2.economy, newClock) : null

      let newPhase = state.phase
      if (state.phase === 'peacetime' && newClock >= 210) {
        newPhase = 'combat'
      }
      if (newClock >= 1200) {
        newPhase = 'post-match'
      }

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

  buildNode: (player, type, dispersed) => {
    set((state) => {
      const key = player === 1 ? 'player1' : 'player2'
      const playerState = state[key]
      if (!playerState.economy) return state
      const result = buildNode(playerState.economy, type, dispersed)
      if (!result) return state
      return { [key]: { ...playerState, economy: result } }
    })
  },

  // Sync full game state to players (display broadcasts every few ticks)
  syncState: () => {
    const { channel, phase, player1, player2, matchClock, isPaused } = get()
    if (!channel) return
    sendMessage(channel, 'game_state_sync', {
      phase,
      matchClock,
      isPaused,
      player1: {
        faction: player1.faction,
        economy: player1.economy,
        connected: player1.connected,
        ready: player1.ready,
      },
      player2: {
        faction: player2.faction,
        economy: player2.economy,
        connected: player2.connected,
        ready: player2.ready,
      },
    }, 'display')
  },

  // Handle incoming messages from other clients
  handleMessage: (msg: RoomMessage) => {
    const state = get()

    switch (msg.type) {
      case 'player_joined': {
        const player = msg.payload.player as 1 | 2
        state.setPlayerConnected(player, true)
        // If display, sync current state to new player
        if (state.role === 'display') {
          setTimeout(() => state.syncState(), 100)
        }
        break
      }
      case 'player_ready': {
        const player = msg.payload.player as 1 | 2
        state.setPlayerReady(player, true)
        break
      }
      case 'faction_selected': {
        const { player, faction } = msg.payload as { player: 1 | 2; faction: FactionId }
        set((s) => ({
          [player === 1 ? 'player1' : 'player2']: {
            ...s[player === 1 ? 'player1' : 'player2'],
            faction,
          },
        }))
        break
      }
      case 'game_start': {
        if (state.role !== 'display') {
          set({ phase: 'briefing', matchClock: 0 })
        }
        break
      }
      case 'build_node': {
        const { player, nodeType, dispersed } = msg.payload as {
          player: 1 | 2; nodeType: NodeType; dispersed: boolean
        }
        state.buildNode(player, nodeType, dispersed)
        break
      }
      case 'pause': {
        set({ isPaused: true })
        break
      }
      case 'resume': {
        set({ isPaused: false })
        break
      }
      case 'phase_change': {
        const { phase } = msg.payload as { phase: GamePhase }
        set({ phase })
        break
      }
      case 'game_state_sync': {
        // Players receive full state from display
        if (state.role !== 'display') {
          const { phase, matchClock, isPaused, player1, player2 } = msg.payload as {
            phase: GamePhase
            matchClock: number
            isPaused: boolean
            player1: PlayerState
            player2: PlayerState
          }
          set({ phase, matchClock, isPaused, player1, player2 })
        }
        break
      }
    }
  },
}))

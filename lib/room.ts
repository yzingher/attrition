import { supabase } from './supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

export type RoomRole = 'display' | 'player1' | 'player2'

export interface RoomMessage {
  type: string
  payload: Record<string, unknown>
  from: RoomRole
  timestamp: number
}

// Message types
export type MessageType =
  | 'player_joined'
  | 'player_ready'
  | 'faction_selected'
  | 'game_start'
  | 'game_tick'
  | 'build_node'
  | 'launch_wave'
  | 'target_node'
  | 'pause'
  | 'resume'
  | 'game_state_sync'
  | 'phase_change'

export function generateRoomId(): string {
  // 6-char alphanumeric code, easy to type on phone
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no ambiguous chars
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

export function createRoom(roomId: string): RealtimeChannel {
  return supabase.channel(`room:${roomId}`, {
    config: {
      broadcast: { self: true },
    },
  })
}

export function sendMessage(
  channel: RealtimeChannel,
  type: MessageType,
  payload: Record<string, unknown>,
  from: RoomRole
) {
  channel.send({
    type: 'broadcast',
    event: 'game',
    payload: {
      type,
      payload,
      from,
      timestamp: Date.now(),
    } satisfies RoomMessage,
  })
}

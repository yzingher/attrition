'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useGameStore } from '@/lib/store'
import { createRoom, sendMessage } from '@/lib/room'
import { PlayerController } from '@/components/player/PlayerController'

export default function PlayPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const roomId = params.roomId as string
  const playerNum = parseInt(searchParams.get('p') || '1') as 1 | 2

  const { setRoom, handleMessage } = useGameStore()
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!roomId) return

    const channel = createRoom(roomId)

    channel
      .on('broadcast', { event: 'game' }, ({ payload }) => {
        useGameStore.getState().handleMessage(payload)
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnected(true)
          setRoom(roomId, playerNum === 1 ? 'player1' : 'player2', channel)

          // Notify display that we joined
          sendMessage(channel, 'player_joined', { player: playerNum }, playerNum === 1 ? 'player1' : 'player2')
        } else if (status === 'CHANNEL_ERROR') {
          setError('Failed to connect to room')
        }
      })

    return () => {
      channel.unsubscribe()
    }
  }, [roomId, playerNum, setRoom, handleMessage])

  if (error) {
    return (
      <div className="h-screen w-screen bg-surface flex items-center justify-center p-6">
        <div className="text-center">
          <p className="font-mono text-danger text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="font-mono text-xs text-accent underline"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="h-screen w-screen bg-surface flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-xs text-gray-500">Connecting to room {roomId}...</p>
        </div>
      </div>
    )
  }

  return <PlayerController playerNum={playerNum} />
}

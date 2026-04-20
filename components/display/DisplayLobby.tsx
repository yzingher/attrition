'use client'

import { useEffect, useState, useRef } from 'react'
import { useGameStore } from '@/lib/store'
import { createRoom, generateRoomId, sendMessage } from '@/lib/room'
import { FACTIONS } from '@/game/data/factions'
import { getMapForMatchup } from '@/game/data/maps'

export function DisplayLobby() {
  const { roomId, phase, player1, player2, setRoom, setPhase, startMatch, handleMessage } = useGameStore()
  const [baseUrl, setBaseUrl] = useState('')
  const channelRef = useRef(useGameStore.getState().channel)

  // Create room on mount
  useEffect(() => {
    setBaseUrl(window.location.origin)

    const id = generateRoomId()
    const channel = createRoom(id)

    channel
      .on('broadcast', { event: 'game' }, ({ payload }) => {
        useGameStore.getState().handleMessage(payload)
      })
      .subscribe()

    setRoom(id, 'display', channel)
    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [setRoom, handleMessage])

  // Auto-advance to faction-select when both connected
  useEffect(() => {
    if (player1.connected && player2.connected && phase === 'lobby') {
      setPhase('faction-select')
    }
  }, [player1.connected, player2.connected, phase, setPhase])

  // Auto-start when both players have factions and are ready
  useEffect(() => {
    if (player1.faction && player2.faction && player1.ready && player2.ready && phase === 'faction-select') {
      startMatch()
    }
  }, [player1, player2, phase, startMatch])

  const p1Url = roomId ? `${baseUrl}/play/${roomId}?p=1` : ''
  const p2Url = roomId ? `${baseUrl}/play/${roomId}?p=2` : ''

  const map = player1.faction && player2.faction
    ? getMapForMatchup(player1.faction, player2.faction)
    : null

  return (
    <div className="h-screen w-screen bg-surface flex flex-col items-center justify-center relative">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `linear-gradient(rgba(0,229,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
      </div>

      <div className="relative z-10 text-center">
        <h1 className="text-6xl font-mono font-bold tracking-[0.3em] text-white mb-2">ATTRITION</h1>
        <p className="text-sm font-mono text-gray-500 tracking-widest uppercase mb-12">
          Production wins wars
        </p>

        {phase === 'lobby' && (
          <>
            {/* QR Codes */}
            <div className="flex gap-16 mb-12">
              {/* Player 1 */}
              <div className="flex flex-col items-center">
                <div className={`w-48 h-48 border-2 flex items-center justify-center mb-4 transition-all ${
                  player1.connected ? 'border-accent bg-accent/10' : 'border-border'
                }`}>
                  {player1.connected ? (
                    <span className="font-mono text-accent text-lg">CONNECTED</span>
                  ) : roomId ? (
                    <QRCode url={p1Url} />
                  ) : (
                    <span className="font-mono text-gray-600 text-xs">Loading...</span>
                  )}
                </div>
                <span className="font-mono text-xs text-accent tracking-wider uppercase">Player 1</span>
                <span className="font-mono text-[10px] text-gray-600 mt-1">Scan to join</span>
              </div>

              {/* Player 2 */}
              <div className="flex flex-col items-center">
                <div className={`w-48 h-48 border-2 flex items-center justify-center mb-4 transition-all ${
                  player2.connected ? 'border-warning bg-warning/10' : 'border-border'
                }`}>
                  {player2.connected ? (
                    <span className="font-mono text-warning text-lg">CONNECTED</span>
                  ) : roomId ? (
                    <QRCode url={p2Url} />
                  ) : (
                    <span className="font-mono text-gray-600 text-xs">Loading...</span>
                  )}
                </div>
                <span className="font-mono text-xs text-warning tracking-wider uppercase">Player 2</span>
                <span className="font-mono text-[10px] text-gray-600 mt-1">Scan to join</span>
              </div>
            </div>

            {/* Room code */}
            {roomId && (
              <div className="mb-4">
                <span className="font-mono text-[10px] text-gray-600">Room Code: </span>
                <span className="font-mono text-lg text-white tracking-[0.2em]">{roomId}</span>
              </div>
            )}
            <p className="font-mono text-[10px] text-gray-600">
              Waiting for both players to connect...
            </p>
          </>
        )}

        {phase === 'faction-select' && (
          <div className="text-center">
            <p className="font-mono text-sm text-gray-400 mb-8">
              Players are choosing factions on their devices...
            </p>
            <div className="flex gap-12 justify-center items-start">
              <div className="text-center">
                <div className="w-3 h-3 rounded-full bg-accent mx-auto mb-2" />
                <p className="font-mono text-xs text-accent">Player 1</p>
                {player1.faction ? (
                  <div className="mt-2">
                    <p className="font-mono text-sm text-white">{FACTIONS[player1.faction].name}</p>
                    <p className="font-mono text-[10px] text-gray-500">{FACTIONS[player1.faction].doctrine}</p>
                    {player1.ready && <p className="font-mono text-[10px] text-success mt-1">READY</p>}
                  </div>
                ) : (
                  <p className="font-mono text-[10px] text-gray-600 mt-2">Choosing...</p>
                )}
              </div>

              {map && (
                <div className="text-center px-8 border-x border-border">
                  <p className="font-mono text-[10px] text-gray-500 uppercase">Theatre</p>
                  <p className="font-mono text-sm text-white mt-1">{map.name}</p>
                  <p className="font-mono text-[10px] text-gray-600">{map.description}</p>
                </div>
              )}

              <div className="text-center">
                <div className="w-3 h-3 rounded-full bg-warning mx-auto mb-2" />
                <p className="font-mono text-xs text-warning">Player 2</p>
                {player2.faction ? (
                  <div className="mt-2">
                    <p className="font-mono text-sm text-white">{FACTIONS[player2.faction].name}</p>
                    <p className="font-mono text-[10px] text-gray-500">{FACTIONS[player2.faction].doctrine}</p>
                    {player2.ready && <p className="font-mono text-[10px] text-success mt-1">READY</p>}
                  </div>
                ) : (
                  <p className="font-mono text-[10px] text-gray-600 mt-2">Choosing...</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Simple QR Code component using an API
function QRCode({ url }: { url: string }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}&bgcolor=0a0e14&color=ffffff&format=svg`
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={qrUrl}
      alt="QR Code"
      className="w-44 h-44"
    />
  )
}

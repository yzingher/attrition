'use client'

import { useGameStore, FactionId } from '@/lib/store'
import { FACTIONS } from '@/game/data/factions'
import { sendMessage } from '@/lib/room'

const factionIds: FactionId[] = ['usa', 'china', 'russia', 'ukraine', 'iran', 'taiwan']

interface PlayerFactionSelectProps {
  playerNum: 1 | 2
  accentColor: string
}

export function PlayerFactionSelect({ playerNum, accentColor }: PlayerFactionSelectProps) {
  const { selectFaction, setPlayerReady, channel, role } = useGameStore()
  const player = useGameStore((s) => s[playerNum === 1 ? 'player1' : 'player2'])
  const opponent = useGameStore((s) => s[playerNum === 1 ? 'player2' : 'player1'])

  const handleSelect = (faction: FactionId) => {
    selectFaction(playerNum, faction)
  }

  const handleReady = () => {
    setPlayerReady(playerNum, true)
    if (channel) {
      sendMessage(channel, 'player_ready', { player: playerNum }, role || 'player1')
    }
  }

  return (
    <div className="min-h-screen w-screen bg-surface p-4 pb-24">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: accentColor }}>
          Player {playerNum}
        </p>
        <h2 className="font-mono text-lg text-white mt-1">Choose Faction</h2>
      </div>

      {/* Faction grid */}
      <div className="space-y-3">
        {factionIds.map((id) => {
          const f = FACTIONS[id]
          const selected = player.faction === id
          const takenByOpponent = opponent.faction === id

          return (
            <button
              key={id}
              onClick={() => handleSelect(id)}
              disabled={takenByOpponent}
              className={`w-full p-4 border text-left transition-all ${
                selected
                  ? 'border-white/50 bg-white/5'
                  : takenByOpponent
                    ? 'border-border/30 opacity-30'
                    : 'border-border active:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: f.accentColor }} />
                <span className="font-mono text-sm font-semibold text-white">{f.name}</span>
                <span className="font-mono text-[10px] text-gray-500 ml-auto">{f.shortName}</span>
              </div>
              <p className="text-xs text-gray-400 ml-6">{f.doctrine}</p>
              {selected && (
                <div className="mt-3 ml-6 space-y-1">
                  <p className="text-[11px] text-success">+ {f.strength}</p>
                  <p className="text-[11px] text-danger">− {f.weakness}</p>
                </div>
              )}
              {takenByOpponent && (
                <p className="text-[10px] text-gray-600 ml-6 mt-1">Taken by opponent</p>
              )}
            </button>
          )
        })}
      </div>

      {/* Ready button - fixed at bottom */}
      {player.faction && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface border-t border-border">
          <button
            onClick={handleReady}
            className="w-full py-4 font-mono text-sm tracking-wider uppercase transition-all border"
            style={{
              borderColor: accentColor,
              color: accentColor,
            }}
          >
            Ready — {FACTIONS[player.faction].shortName}
          </button>
        </div>
      )}
    </div>
  )
}

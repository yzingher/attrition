'use client'

import { useGameStore, FactionId } from '@/lib/store'
import { FACTIONS } from '@/game/data/factions'

const factionIds: FactionId[] = ['usa', 'china', 'russia', 'ukraine', 'iran', 'taiwan']

export function FactionSelect() {
  const { player1, player2, selectFaction, startMatch, setPhase } = useGameStore()

  const canStart = player1.faction && player2.faction && player1.faction !== player2.faction

  return (
    <div className="h-screen w-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-border">
        <button
          onClick={() => setPhase('title')}
          className="text-gray-500 font-mono text-sm hover:text-white transition-colors"
        >
          ← BACK
        </button>
        <h2 className="font-mono text-sm tracking-widest text-gray-400 uppercase">
          Select Factions
        </h2>
        <div className="w-16" />
      </div>

      {/* Two-column faction selection */}
      <div className="flex-1 flex">
        {/* Player 1 */}
        <div className="flex-1 border-r border-border p-8">
          <h3 className="font-mono text-xs tracking-widest text-accent mb-6 uppercase">
            Player 1 — Left Side
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {factionIds.map((id) => {
              const f = FACTIONS[id]
              const selected = player1.faction === id
              const takenByOther = player2.faction === id
              return (
                <button
                  key={id}
                  onClick={() => selectFaction(1, id)}
                  disabled={takenByOther}
                  className={`p-4 border text-left transition-all duration-150 ${
                    selected
                      ? 'border-accent bg-accent/10'
                      : takenByOther
                        ? 'border-border opacity-30 cursor-not-allowed'
                        : 'border-border hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: f.accentColor }}
                    />
                    <span className="font-mono text-sm font-semibold">{f.shortName}</span>
                  </div>
                  <p className="text-xs text-gray-500">{f.doctrine}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Player 2 */}
        <div className="flex-1 p-8">
          <h3 className="font-mono text-xs tracking-widest text-warning mb-6 uppercase">
            Player 2 — Right Side
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {factionIds.map((id) => {
              const f = FACTIONS[id]
              const selected = player2.faction === id
              const takenByOther = player1.faction === id
              return (
                <button
                  key={id}
                  onClick={() => selectFaction(2, id)}
                  disabled={takenByOther}
                  className={`p-4 border text-left transition-all duration-150 ${
                    selected
                      ? 'border-warning bg-warning/10'
                      : takenByOther
                        ? 'border-border opacity-30 cursor-not-allowed'
                        : 'border-border hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: f.accentColor }}
                    />
                    <span className="font-mono text-sm font-semibold">{f.shortName}</span>
                  </div>
                  <p className="text-xs text-gray-500">{f.doctrine}</p>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Faction detail + start */}
      <div className="border-t border-border px-8 py-6 flex items-center justify-between">
        <div className="flex gap-12">
          {player1.faction && (
            <div>
              <span className="text-xs text-gray-500 font-mono">P1: </span>
              <span className="text-sm font-mono text-accent">
                {FACTIONS[player1.faction].name}
              </span>
              <p className="text-xs text-gray-600 mt-1">
                + {FACTIONS[player1.faction].strength}
              </p>
            </div>
          )}
          {player2.faction && (
            <div>
              <span className="text-xs text-gray-500 font-mono">P2: </span>
              <span className="text-sm font-mono text-warning">
                {FACTIONS[player2.faction].name}
              </span>
              <p className="text-xs text-gray-600 mt-1">
                + {FACTIONS[player2.faction].strength}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={() => startMatch()}
          disabled={!canStart}
          className={`px-8 py-3 font-mono text-sm tracking-wider uppercase transition-all duration-150 ${
            canStart
              ? 'border border-accent text-accent hover:bg-accent hover:text-surface'
              : 'border border-border text-gray-600 cursor-not-allowed'
          }`}
        >
          Begin
        </button>
      </div>
    </div>
  )
}

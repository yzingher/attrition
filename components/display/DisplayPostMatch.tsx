'use client'

import { useGameStore } from '@/lib/store'
import { FACTIONS } from '@/game/data/factions'

export function DisplayPostMatch() {
  const { player1, player2, matchClock, reset } = useGameStore()

  const p1Faction = player1.faction ? FACTIONS[player1.faction] : null
  const p2Faction = player2.faction ? FACTIONS[player2.faction] : null

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Determine winner
  const p1Score = (player1.economy?.resources.assembled || 0) + (player1.economy?.productionRate || 0) * 2
  const p2Score = (player2.economy?.resources.assembled || 0) + (player2.economy?.productionRate || 0) * 2
  const winner = p1Score > p2Score ? 1 : p2Score > p1Score ? 2 : 0

  return (
    <div className="h-screen w-screen bg-surface flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full px-8">
        <h1 className="font-mono text-3xl text-center text-white mb-2 tracking-[0.2em]">
          MATCH COMPLETE
        </h1>
        <p className="font-mono text-xs text-center text-gray-500 mb-4">
          Duration: {formatTime(matchClock)} &middot; {matchClock >= 1200 ? 'Timeout — Attrition Score' : 'Production Collapse'}
        </p>

        {winner > 0 && (
          <p className="font-mono text-center text-lg mb-10" style={{
            color: winner === 1 ? p1Faction?.accentColor : p2Faction?.accentColor
          }}>
            {winner === 1 ? p1Faction?.name : p2Faction?.name} Victory
          </p>
        )}

        <div className="grid grid-cols-2 gap-8 mb-12">
          <div className={`border p-6 ${winner === 1 ? 'border-accent/50' : 'border-border'}`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p1Faction?.accentColor }} />
              <span className="font-mono text-sm">{p1Faction?.name}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-gray-500">Final Stockpile</span>
                <span className="text-white">{Math.floor(player1.economy?.resources.assembled || 0)}</span>
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-gray-500">Total Produced</span>
                <span className="text-white">{Math.floor(player1.economy?.totalProduced || 0)}</span>
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-gray-500">Peak Rate</span>
                <span className="text-white">{(player1.economy?.peakProductionRate || 0).toFixed(1)}/min</span>
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-gray-500">Final Rate</span>
                <span className="text-white">{(player1.economy?.productionRate || 0).toFixed(1)}/min</span>
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-gray-500">Attrition Score</span>
                <span className="text-white">{Math.floor(p1Score)}</span>
              </div>
            </div>
          </div>

          <div className={`border p-6 ${winner === 2 ? 'border-warning/50' : 'border-border'}`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p2Faction?.accentColor }} />
              <span className="font-mono text-sm">{p2Faction?.name}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-gray-500">Final Stockpile</span>
                <span className="text-white">{Math.floor(player2.economy?.resources.assembled || 0)}</span>
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-gray-500">Total Produced</span>
                <span className="text-white">{Math.floor(player2.economy?.totalProduced || 0)}</span>
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-gray-500">Peak Rate</span>
                <span className="text-white">{(player2.economy?.peakProductionRate || 0).toFixed(1)}/min</span>
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-gray-500">Final Rate</span>
                <span className="text-white">{(player2.economy?.productionRate || 0).toFixed(1)}/min</span>
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-gray-500">Attrition Score</span>
                <span className="text-white">{Math.floor(p2Score)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-border p-4 mb-10">
          <p className="font-mono text-[10px] text-gray-500 uppercase tracking-wider mb-2">Turning Point</p>
          <p className="text-sm text-gray-400">
            Production analytics will identify the decision that determined the match outcome.
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={reset}
            className="px-10 py-3 border border-accent text-accent font-mono text-sm tracking-wider
                       hover:bg-accent hover:text-surface transition-all duration-150 uppercase"
          >
            New Match
          </button>
        </div>
      </div>
    </div>
  )
}

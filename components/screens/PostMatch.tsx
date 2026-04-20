'use client'

import { useGameStore } from '@/lib/store'
import { FACTIONS } from '@/game/data/factions'

export function PostMatch() {
  const { player1, player2, matchClock, reset, setPhase } = useGameStore()

  const p1Faction = player1.faction ? FACTIONS[player1.faction] : null
  const p2Faction = player2.faction ? FACTIONS[player2.faction] : null

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="h-screen w-screen bg-surface flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full px-8">
        {/* Header */}
        <h1 className="font-mono text-2xl text-center text-white mb-2 tracking-wider">
          MATCH COMPLETE
        </h1>
        <p className="font-mono text-xs text-center text-gray-500 mb-12">
          Duration: {formatTime(matchClock)} &middot; Victory: Timeout (Attrition Score)
        </p>

        {/* Result cards */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          <div className="border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p1Faction?.accentColor }} />
              <span className="font-mono text-sm">{p1Faction?.name}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-gray-500">Production Rate</span>
                <span className="text-white">—</span>
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-gray-500">Units Produced</span>
                <span className="text-white">—</span>
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-gray-500">Kill:Cost Ratio</span>
                <span className="text-white">—</span>
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-gray-500">Nodes Destroyed</span>
                <span className="text-white">—</span>
              </div>
            </div>
          </div>

          <div className="border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p2Faction?.accentColor }} />
              <span className="font-mono text-sm">{p2Faction?.name}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-gray-500">Production Rate</span>
                <span className="text-white">—</span>
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-gray-500">Units Produced</span>
                <span className="text-white">—</span>
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-gray-500">Kill:Cost Ratio</span>
                <span className="text-white">—</span>
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-gray-500">Nodes Destroyed</span>
                <span className="text-white">—</span>
              </div>
            </div>
          </div>
        </div>

        {/* Turning point placeholder */}
        <div className="border border-border p-4 mb-12">
          <p className="font-mono text-[10px] text-gray-500 uppercase tracking-wider mb-2">
            Turning Point
          </p>
          <p className="text-sm text-gray-400">
            Analytics will identify the decision that determined the match outcome.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              useGameStore.setState({ matchClock: 0, phase: 'briefing' })
            }}
            className="px-8 py-3 border border-accent text-accent font-mono text-sm tracking-wider
                       hover:bg-accent hover:text-surface transition-all duration-150 uppercase"
          >
            Rematch
          </button>
          <button
            onClick={() => setPhase('faction-select')}
            className="px-8 py-3 border border-border text-gray-400 font-mono text-sm tracking-wider
                       hover:border-gray-500 hover:text-white transition-all duration-150 uppercase"
          >
            New Matchup
          </button>
          <button
            onClick={reset}
            className="px-8 py-3 border border-border text-gray-600 font-mono text-sm tracking-wider
                       hover:border-gray-500 hover:text-gray-400 transition-all duration-150 uppercase"
          >
            Quit
          </button>
        </div>
      </div>
    </div>
  )
}

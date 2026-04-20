'use client'

import { useState } from 'react'
import { useGameStore } from '@/lib/store'
import { NodeType, PRODUCTION_CONSTANTS as C } from '@/game/sim/types'

interface BuildPanelProps {
  player: 1 | 2
  accentColor: string
}

const NODE_INFO: { type: NodeType; label: string; icon: string; desc: string }[] = [
  { type: 'raw', label: 'Raw Input', icon: '⬡', desc: 'Generates raw materials' },
  { type: 'component', label: 'Component Fab', icon: '◈', desc: 'Converts raw → components' },
  { type: 'assembly', label: 'Assembly Line', icon: '▣', desc: 'Builds drones from components' },
  { type: 'energy', label: 'Energy Grid', icon: '⚡', desc: '+25% all production' },
  { type: 'human-capital', label: 'Human Capital', icon: '◉', desc: '+20% efficiency (irreplaceable)' },
]

export function BuildPanel({ player, accentColor }: BuildPanelProps) {
  const [showBuild, setShowBuild] = useState(false)
  const { phase, buildNode } = useGameStore()
  const economy = useGameStore((s) => s[player === 1 ? 'player1' : 'player2'].economy)

  if (!economy) return null
  if (phase !== 'peacetime') return null

  return (
    <div className="border-t border-border/50 pt-2 mt-2">
      <button
        onClick={() => setShowBuild(!showBuild)}
        className="w-full text-left font-mono text-[10px] uppercase tracking-wider hover:text-white transition-colors"
        style={{ color: accentColor }}
      >
        {showBuild ? '▾ Build' : '▸ Build Node'}
      </button>

      {showBuild && (
        <div className="mt-2 space-y-1">
          {NODE_INFO.map(({ type, label, icon, desc }) => {
            const cost = C.BUILD_COSTS[type]
            const canAfford = economy.resources.assembled >= cost
            return (
              <div key={type} className="group">
                <button
                  onClick={() => buildNode(player, type, false)}
                  disabled={!canAfford}
                  className={`w-full text-left p-1.5 border transition-all ${
                    canAfford
                      ? 'border-border/50 hover:border-gray-500 cursor-pointer'
                      : 'border-border/30 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-gray-300">
                      {icon} {label}
                    </span>
                    <span className="font-mono text-[9px] text-gray-500">{cost}u</span>
                  </div>
                  <p className="font-mono text-[8px] text-gray-600 mt-0.5">{desc}</p>
                </button>
                {/* Dispersed variant */}
                {canAfford && (
                  <button
                    onClick={() => buildNode(player, type, true)}
                    disabled={economy.resources.assembled < cost * C.DISPERSED_COST_MULT}
                    className="w-full text-left pl-4 py-0.5 font-mono text-[8px] text-gray-600 hover:text-gray-400 transition-colors"
                  >
                    └ dispersed (+{Math.round((C.DISPERSED_COST_MULT - 1) * 100)}% cost, −{Math.round((1 - C.DISPERSED_THROUGHPUT_MULT) * 100)}% output, survives strikes)
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

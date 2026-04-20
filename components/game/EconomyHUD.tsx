'use client'

import { useGameStore } from '@/lib/store'
import { NodeType } from '@/game/sim/types'
import { BuildPanel } from './BuildPanel'

interface EconomyHUDProps {
  player: 1 | 2
  accentColor: string
}

const NODE_DISPLAY: { type: NodeType; label: string; icon: string }[] = [
  { type: 'raw', label: 'Raw Inputs', icon: '⬡' },
  { type: 'component', label: 'Components', icon: '◈' },
  { type: 'assembly', label: 'Assembly', icon: '▣' },
  { type: 'energy', label: 'Energy', icon: '⚡' },
  { type: 'human-capital', label: 'Human Cap', icon: '◉' },
]

export function EconomyHUD({ player, accentColor }: EconomyHUDProps) {
  const economy = useGameStore((s) => s[player === 1 ? 'player1' : 'player2'].economy)

  if (!economy) return null

  const { resources, productionNodes, energyOutput, humanCapital, totalProduced, productionRate } = economy

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="font-mono text-[10px] tracking-wider mb-2 uppercase" style={{ color: accentColor }}>
        Supply Chain
      </div>

      {/* Resource counters */}
      <div className="grid grid-cols-3 gap-1 mb-2">
        <div className="bg-surface/50 p-1.5 text-center">
          <div className="font-mono text-[9px] text-gray-500">Raw</div>
          <div className="font-mono text-xs text-white tabular-nums">{Math.floor(resources.raw)}</div>
        </div>
        <div className="bg-surface/50 p-1.5 text-center">
          <div className="font-mono text-[9px] text-gray-500">Comp</div>
          <div className="font-mono text-xs text-white tabular-nums">{Math.floor(resources.components)}</div>
        </div>
        <div className="bg-surface/50 p-1.5 text-center">
          <div className="font-mono text-[9px] text-gray-500">Drones</div>
          <div className="font-mono text-xs text-white tabular-nums">{Math.floor(resources.assembled)}</div>
        </div>
      </div>

      {/* Production nodes by type */}
      <div className="space-y-1 flex-1">
        {NODE_DISPLAY.map(({ type, label, icon }) => {
          const nodesOfType = productionNodes.filter(n => n.type === type)
          const activeNodes = nodesOfType.filter(n => n.active && n.health > 0)
          const avgHealth = activeNodes.length > 0
            ? activeNodes.reduce((s, n) => s + n.health, 0) / activeNodes.length
            : 0

          return (
            <div key={type} className="border border-border/50 p-1.5 bg-surface/30">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-gray-400 flex items-center gap-1">
                  <span className="text-xs">{icon}</span>
                  {label}
                </span>
                <span className="font-mono text-[9px] text-gray-500">
                  {activeNodes.length}/{nodesOfType.length}
                </span>
              </div>
              <div className="h-1 bg-border mt-1 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${avgHealth}%`,
                    backgroundColor: accentColor,
                    opacity: 0.6,
                  }}
                />
              </div>
              {nodesOfType.some(n => n.dispersed) && (
                <div className="font-mono text-[8px] text-gray-600 mt-0.5">
                  {nodesOfType.filter(n => n.dispersed).length} dispersed
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Multipliers */}
      <div className="border-t border-border/50 pt-2 mt-2 space-y-0.5">
        <div className="flex justify-between font-mono text-[9px]">
          <span className="text-gray-500">Energy Mult</span>
          <span className={energyOutput > 1 ? 'text-success' : 'text-gray-400'}>
            ×{energyOutput.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between font-mono text-[9px]">
          <span className="text-gray-500">Human Cap</span>
          <span className={humanCapital > 1 ? 'text-success' : 'text-gray-400'}>
            ×{humanCapital.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="border-t border-border/50 pt-2 mt-2 space-y-0.5">
        <div className="flex justify-between font-mono text-[10px]">
          <span className="text-gray-500">Stockpile</span>
          <span className="text-white tabular-nums">{Math.floor(resources.assembled)}</span>
        </div>
        <div className="flex justify-between font-mono text-[10px]">
          <span className="text-gray-500">Rate</span>
          <span className="text-white tabular-nums">{productionRate.toFixed(1)}/min</span>
        </div>
        <div className="flex justify-between font-mono text-[10px]">
          <span className="text-gray-500">Total Built</span>
          <span className="text-white tabular-nums">{Math.floor(totalProduced)}</span>
        </div>
      </div>

      {/* Build panel (peacetime only) */}
      <BuildPanel player={player} accentColor={accentColor} />
    </div>
  )
}

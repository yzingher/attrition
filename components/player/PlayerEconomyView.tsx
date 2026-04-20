'use client'

import { useState } from 'react'
import { useGameStore } from '@/lib/store'
import { FACTIONS } from '@/game/data/factions'
import { NodeType, PRODUCTION_CONSTANTS as C } from '@/game/sim/types'
import { sendMessage } from '@/lib/room'

interface PlayerEconomyViewProps {
  playerNum: 1 | 2
  accentColor: string
}

const NODE_INFO: { type: NodeType; label: string; icon: string; desc: string }[] = [
  { type: 'raw', label: 'Raw Input', icon: '⬡', desc: 'Generates raw materials' },
  { type: 'component', label: 'Component Fab', icon: '◈', desc: 'Raw → Components' },
  { type: 'assembly', label: 'Assembly Line', icon: '▣', desc: 'Components → Drones' },
  { type: 'energy', label: 'Energy Grid', icon: '⚡', desc: '+25% all production' },
  { type: 'human-capital', label: 'Human Capital', icon: '◉', desc: '+20% efficiency' },
]

export function PlayerEconomyView({ playerNum, accentColor }: PlayerEconomyViewProps) {
  const [tab, setTab] = useState<'status' | 'build' | 'attack'>('status')
  const phase = useGameStore((s) => s.phase)
  const matchClock = useGameStore((s) => s.matchClock)
  const isPaused = useGameStore((s) => s.isPaused)
  const player = useGameStore((s) => s[playerNum === 1 ? 'player1' : 'player2'])
  const channel = useGameStore((s) => s.channel)
  const role = useGameStore((s) => s.role)
  const togglePause = useGameStore((s) => s.togglePause)

  const economy = player.economy
  const faction = player.faction ? FACTIONS[player.faction] : null

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleBuild = (type: NodeType, dispersed: boolean) => {
    if (channel) {
      sendMessage(channel, 'build_node', { player: playerNum, nodeType: type, dispersed }, role || 'player1')
    }
  }

  const handlePause = () => {
    togglePause()
  }

  return (
    <div className="min-h-screen w-screen bg-surface flex flex-col">
      {/* Status bar */}
      <div className="shrink-0 border-b border-border px-4 py-2 flex items-center justify-between bg-panel/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
          <span className="font-mono text-[10px]" style={{ color: accentColor }}>
            {faction?.shortName}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`font-mono text-[9px] uppercase px-2 py-0.5 border ${
            phase === 'peacetime' ? 'border-success/30 text-success' : 'border-danger/30 text-danger'
          }`}>
            {phase === 'peacetime' ? 'PEACE' : 'WAR'}
          </span>
          <span className="font-mono text-xs text-white tabular-nums">{formatTime(matchClock)}</span>
        </div>
        <button
          onClick={handlePause}
          className="font-mono text-[10px] text-gray-500 px-2 py-1 border border-border active:border-gray-500"
        >
          {isPaused ? '▶' : '⏸'}
        </button>
      </div>

      {/* Resource bar */}
      {economy && (
        <div className="shrink-0 grid grid-cols-3 border-b border-border">
          <div className="p-3 text-center border-r border-border">
            <p className="font-mono text-[9px] text-gray-500">RAW</p>
            <p className="font-mono text-lg text-white tabular-nums">{Math.floor(economy.resources.raw)}</p>
          </div>
          <div className="p-3 text-center border-r border-border">
            <p className="font-mono text-[9px] text-gray-500">COMP</p>
            <p className="font-mono text-lg text-white tabular-nums">{Math.floor(economy.resources.components)}</p>
          </div>
          <div className="p-3 text-center">
            <p className="font-mono text-[9px] text-gray-500">DRONES</p>
            <p className="font-mono text-lg text-white tabular-nums">{Math.floor(economy.resources.assembled)}</p>
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="shrink-0 flex border-b border-border">
        {(['status', 'build', 'attack'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 font-mono text-[10px] uppercase tracking-wider transition-colors ${
              tab === t ? 'text-white border-b-2' : 'text-gray-600'
            }`}
            style={tab === t ? { borderBottomColor: accentColor } : undefined}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'status' && economy && (
          <div className="space-y-3">
            {/* Production nodes */}
            {NODE_INFO.map(({ type, label, icon }) => {
              const nodes = economy.productionNodes.filter(n => n.type === type)
              const active = nodes.filter(n => n.active && n.health > 0)
              const avgHealth = active.length > 0
                ? active.reduce((s, n) => s + n.health, 0) / active.length
                : 0

              return (
                <div key={type} className="border border-border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-gray-300">
                      {icon} {label}
                    </span>
                    <span className="font-mono text-[10px] text-gray-500">
                      {active.length}/{nodes.length} active
                    </span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${avgHealth}%`, backgroundColor: accentColor, opacity: 0.7 }}
                    />
                  </div>
                  {nodes.some(n => n.dispersed) && (
                    <p className="font-mono text-[9px] text-gray-600 mt-1">
                      {nodes.filter(n => n.dispersed).length} dispersed
                    </p>
                  )}
                </div>
              )
            })}

            {/* Multipliers */}
            <div className="border border-border p-3 space-y-2">
              <div className="flex justify-between">
                <span className="font-mono text-[10px] text-gray-500">Energy Multiplier</span>
                <span className="font-mono text-xs text-success">×{economy.energyOutput.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-[10px] text-gray-500">Human Capital</span>
                <span className="font-mono text-xs text-success">×{economy.humanCapital.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-[10px] text-gray-500">Production Rate</span>
                <span className="font-mono text-xs text-white">{economy.productionRate.toFixed(1)}/min</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-[10px] text-gray-500">Total Produced</span>
                <span className="font-mono text-xs text-white">{Math.floor(economy.totalProduced)}</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'build' && economy && (
          <div className="space-y-3">
            {phase !== 'peacetime' && (
              <p className="font-mono text-[10px] text-gray-500 text-center py-4">
                Building only available during peacetime
              </p>
            )}
            {phase === 'peacetime' && NODE_INFO.map(({ type, label, icon, desc }) => {
              const cost = C.BUILD_COSTS[type]
              const dispersedCost = Math.ceil(cost * C.DISPERSED_COST_MULT)
              const canAfford = economy.resources.assembled >= cost
              const canAffordDispersed = economy.resources.assembled >= dispersedCost

              return (
                <div key={type} className="border border-border p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs text-gray-300">{icon} {label}</span>
                    <span className="font-mono text-[10px] text-gray-500">{cost} drones</span>
                  </div>
                  <p className="font-mono text-[9px] text-gray-600 mb-3">{desc}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBuild(type, false)}
                      disabled={!canAfford}
                      className={`flex-1 py-2 font-mono text-[10px] border transition-all ${
                        canAfford
                          ? 'border-gray-500 text-white active:bg-white/10'
                          : 'border-border text-gray-700'
                      }`}
                    >
                      Concentrated
                    </button>
                    <button
                      onClick={() => handleBuild(type, true)}
                      disabled={!canAffordDispersed}
                      className={`flex-1 py-2 font-mono text-[10px] border transition-all ${
                        canAffordDispersed
                          ? 'border-gray-500 text-white active:bg-white/10'
                          : 'border-border text-gray-700'
                      }`}
                    >
                      Dispersed ({dispersedCost})
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'attack' && (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <div className="text-center">
              <p className="font-mono text-xs text-gray-500 mb-2">Attack Controls</p>
              <p className="font-mono text-[10px] text-gray-700">
                {phase === 'peacetime'
                  ? 'Available when combat begins'
                  : 'Coming in next milestone'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

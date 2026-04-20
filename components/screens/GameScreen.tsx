'use client'

import { useEffect, useRef } from 'react'
import { useGameStore } from '@/lib/store'
import { FACTIONS } from '@/game/data/factions'
import { getMapForMatchup } from '@/game/data/maps'
import { GameCanvas } from '@/game/render/GameCanvas'
import { EconomyHUD } from '@/components/game/EconomyHUD'

export function GameScreen() {
  const { phase, player1, player2, matchClock, isPaused, setPhase, togglePause, tick } = useGameStore()
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const p1Faction = player1.faction ? FACTIONS[player1.faction] : null
  const p2Faction = player2.faction ? FACTIONS[player2.faction] : null
  const currentMap = getMapForMatchup(player1.faction || 'china', player2.faction || 'taiwan')

  // Game clock
  useEffect(() => {
    if (phase === 'briefing') {
      const t = setTimeout(() => setPhase('peacetime'), 5000)
      return () => clearTimeout(t)
    }
  }, [phase, setPhase])

  useEffect(() => {
    if ((phase === 'peacetime' || phase === 'combat') && !isPaused) {
      clockRef.current = setInterval(() => {
        tick()
      }, 1000)
      return () => {
        if (clockRef.current) clearInterval(clockRef.current)
      }
    }
  }, [phase, isPaused, tick])

  // Keyboard: pause with Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') togglePause()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [togglePause])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const phaseLabel = phase === 'briefing'
    ? 'DOCTRINE BRIEFING'
    : phase === 'peacetime'
      ? 'PEACETIME'
      : 'ATTRITION'

  const peacetimeRemaining = phase === 'peacetime' ? Math.max(0, 210 - matchClock) : 0

  return (
    <div className="h-screen w-screen bg-surface flex flex-col relative select-none">
      {/* Top bar */}
      <div className="h-10 border-b border-border flex items-center justify-between px-4 shrink-0 bg-panel/50">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p1Faction?.accentColor }} />
          <span className="font-mono text-xs" style={{ color: p1Faction?.accentColor }}>
            {p1Faction?.shortName}
          </span>
          <span className="font-mono text-[10px] text-gray-600">{p1Faction?.doctrine}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
              phase === 'peacetime' ? 'border-success/30 text-success' : 'border-danger/30 text-danger'
            }`}>
              {phaseLabel}
            </span>
            {phase === 'peacetime' && (
              <span className="font-mono text-[10px] text-gray-500">
                Combat in {formatTime(peacetimeRemaining)}
              </span>
            )}
          </div>
          <span className="font-mono text-sm text-white tabular-nums tracking-wider">
            {formatTime(matchClock)}
          </span>
          <span className="font-mono text-[10px] text-gray-600">/ 20:00</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-gray-600">{p2Faction?.doctrine}</span>
          <span className="font-mono text-xs" style={{ color: p2Faction?.accentColor }}>
            {p2Faction?.shortName}
          </span>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p2Faction?.accentColor }} />
        </div>
      </div>

      {/* Main game area */}
      <div className="flex-1 flex min-h-0">
        {/* P1 HUD */}
        <div className="w-52 border-r border-border bg-panel/30 p-3 shrink-0 overflow-y-auto">
          <EconomyHUD player={1} accentColor={p1Faction?.accentColor || '#3498db'} />
        </div>

        {/* Map canvas area */}
        <div className="flex-1 relative min-h-0">
          {/* Briefing overlay */}
          {phase === 'briefing' && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-surface/95">
              <div className="max-w-lg text-center">
                <h2 className="font-mono text-lg text-white mb-2 tracking-wider">DOCTRINE BRIEFING</h2>
                <p className="font-mono text-[10px] text-gray-500 mb-6">
                  {currentMap?.name} — {currentMap?.description}
                </p>
                <div className="grid grid-cols-2 gap-8 text-left">
                  <div className="border border-border p-4">
                    <p className="font-mono text-xs mb-1" style={{ color: p1Faction?.accentColor }}>
                      {p1Faction?.name}
                    </p>
                    <p className="text-[10px] text-gray-400 mb-3">{p1Faction?.doctrine}</p>
                    <p className="text-[10px] text-success">+ {p1Faction?.strength}</p>
                    <p className="text-[10px] text-danger mt-1">− {p1Faction?.weakness}</p>
                  </div>
                  <div className="border border-border p-4">
                    <p className="font-mono text-xs mb-1" style={{ color: p2Faction?.accentColor }}>
                      {p2Faction?.name}
                    </p>
                    <p className="text-[10px] text-gray-400 mb-3">{p2Faction?.doctrine}</p>
                    <p className="text-[10px] text-success">+ {p2Faction?.strength}</p>
                    <p className="text-[10px] text-danger mt-1">− {p2Faction?.weakness}</p>
                  </div>
                </div>
                <p className="mt-6 text-[10px] text-gray-600 font-mono animate-pulse">
                  Match begins in 5 seconds...
                </p>
              </div>
            </div>
          )}

          {/* Phase transition flash */}
          {phase === 'combat' && matchClock >= 210 && matchClock < 213 && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="text-center">
                <span className="font-mono text-xl text-danger animate-pulse tracking-[0.3em]">
                  COMBAT INITIATED
                </span>
                <p className="font-mono text-[10px] text-gray-500 mt-2">Waves begin</p>
              </div>
            </div>
          )}

          {/* PixiJS Canvas */}
          {currentMap && (
            <GameCanvas
              map={currentMap}
              p1Color={p1Faction?.accentColor || '#3498db'}
              p2Color={p2Faction?.accentColor || '#e74c3c'}
            />
          )}
        </div>

        {/* P2 HUD */}
        <div className="w-52 border-l border-border bg-panel/30 p-3 shrink-0 overflow-y-auto">
          <EconomyHUD player={2} accentColor={p2Faction?.accentColor || '#e74c3c'} />
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="h-6 border-t border-border bg-panel/50 flex items-center px-4 justify-between shrink-0">
        <span className="font-mono text-[9px] text-gray-600">
          ESC: Pause | {currentMap?.name}
        </span>
        <span className="font-mono text-[9px] text-gray-600">
          {phase === 'peacetime' ? 'Build your supply chain' : 'Destroy theirs'}
        </span>
      </div>

      {/* Pause overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/85 flex items-center justify-center z-50">
          <div className="text-center">
            <h2 className="font-mono text-2xl text-white mb-2 tracking-[0.2em]">PAUSED</h2>
            <p className="font-mono text-[10px] text-gray-500 mb-6">Press ESC to resume</p>
            <div className="flex gap-8 text-center">
              <div>
                <p className="font-mono text-[10px] text-gray-500">Match Time</p>
                <p className="font-mono text-sm text-white">{formatTime(matchClock)}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] text-gray-500">Phase</p>
                <p className="font-mono text-sm text-white">{phaseLabel}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

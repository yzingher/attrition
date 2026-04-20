'use client'

import { useEffect, useRef } from 'react'
import { useGameStore } from '@/lib/store'
import { FACTIONS } from '@/game/data/factions'
import { getMapForMatchup } from '@/game/data/maps'
import { GameCanvas } from '@/game/render/GameCanvas'

export function DisplayGame() {
  const { phase, player1, player2, matchClock, isPaused, setPhase, tick, syncState } = useGameStore()
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const syncRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const p1Faction = player1.faction ? FACTIONS[player1.faction] : null
  const p2Faction = player2.faction ? FACTIONS[player2.faction] : null
  const currentMap = getMapForMatchup(player1.faction || 'china', player2.faction || 'taiwan')

  // Briefing auto-advance
  useEffect(() => {
    if (phase === 'briefing') {
      const t = setTimeout(() => setPhase('peacetime'), 5000)
      return () => clearTimeout(t)
    }
  }, [phase, setPhase])

  // Game tick (display is the authority)
  useEffect(() => {
    if ((phase === 'peacetime' || phase === 'combat') && !isPaused) {
      clockRef.current = setInterval(() => tick(), 1000)
      return () => { if (clockRef.current) clearInterval(clockRef.current) }
    }
  }, [phase, isPaused, tick])

  // Sync state to players every 2 seconds
  useEffect(() => {
    if (phase === 'peacetime' || phase === 'combat') {
      syncRef.current = setInterval(() => syncState(), 2000)
      return () => { if (syncRef.current) clearInterval(syncRef.current) }
    }
  }, [phase, syncState])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const phaseLabel = phase === 'briefing' ? 'BRIEFING' : phase === 'peacetime' ? 'PEACETIME' : 'ATTRITION'
  const peacetimeRemaining = phase === 'peacetime' ? Math.max(0, 210 - matchClock) : 0

  return (
    <div className="h-screen w-screen bg-surface flex flex-col relative select-none">
      {/* Top bar - public info */}
      <div className="h-12 border-b border-border flex items-center justify-between px-6 shrink-0 bg-panel/50">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p1Faction?.accentColor }} />
          <span className="font-mono text-sm font-semibold" style={{ color: p1Faction?.accentColor }}>
            {p1Faction?.name}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className={`font-mono text-[10px] uppercase tracking-wider px-3 py-1 border ${
            phase === 'peacetime' ? 'border-success/40 text-success' : 'border-danger/40 text-danger'
          }`}>
            {phaseLabel}
          </span>
          {phase === 'peacetime' && (
            <span className="font-mono text-xs text-gray-500">
              Combat in {formatTime(peacetimeRemaining)}
            </span>
          )}
          <span className="font-mono text-xl text-white tabular-nums tracking-wider">
            {formatTime(matchClock)}
          </span>
          <span className="font-mono text-xs text-gray-600">/ 20:00</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-semibold" style={{ color: p2Faction?.accentColor }}>
            {p2Faction?.name}
          </span>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p2Faction?.accentColor }} />
        </div>
      </div>

      {/* Main map area - full width, cinematic */}
      <div className="flex-1 relative min-h-0">
        {/* Briefing overlay */}
        {phase === 'briefing' && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-surface/95">
            <div className="max-w-2xl text-center">
              <h2 className="font-mono text-2xl text-white mb-2 tracking-[0.2em]">DOCTRINE BRIEFING</h2>
              <p className="font-mono text-xs text-gray-500 mb-8">
                {currentMap?.name} — {currentMap?.description}
              </p>
              <div className="grid grid-cols-2 gap-12 text-left">
                <div className="border border-border p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p1Faction?.accentColor }} />
                    <span className="font-mono text-sm" style={{ color: p1Faction?.accentColor }}>
                      {p1Faction?.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{p1Faction?.doctrine}</p>
                  <p className="text-xs text-success">+ {p1Faction?.strength}</p>
                  <p className="text-xs text-danger mt-1">− {p1Faction?.weakness}</p>
                </div>
                <div className="border border-border p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p2Faction?.accentColor }} />
                    <span className="font-mono text-sm" style={{ color: p2Faction?.accentColor }}>
                      {p2Faction?.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{p2Faction?.doctrine}</p>
                  <p className="text-xs text-success">+ {p2Faction?.strength}</p>
                  <p className="text-xs text-danger mt-1">− {p2Faction?.weakness}</p>
                </div>
              </div>
              <p className="mt-8 text-xs text-gray-600 font-mono animate-pulse">
                Match begins in 5 seconds...
              </p>
            </div>
          </div>
        )}

        {/* Combat phase flash */}
        {phase === 'combat' && matchClock >= 210 && matchClock < 213 && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <span className="font-mono text-3xl text-danger animate-pulse tracking-[0.3em]">
              COMBAT INITIATED
            </span>
          </div>
        )}

        {/* PixiJS Map - full area */}
        {currentMap && (
          <GameCanvas
            map={currentMap}
            p1Color={p1Faction?.accentColor || '#3498db'}
            p2Color={p2Faction?.accentColor || '#e74c3c'}
          />
        )}
      </div>

      {/* Bottom bar - public economy summary */}
      <div className="h-16 border-t border-border bg-panel/50 flex items-center px-6 justify-between shrink-0">
        <div className="flex items-center gap-6">
          <div>
            <p className="font-mono text-[9px] text-gray-500 uppercase">P1 Stockpile</p>
            <p className="font-mono text-sm tabular-nums" style={{ color: p1Faction?.accentColor }}>
              {Math.floor(player1.economy?.resources.assembled || 0)}
            </p>
          </div>
          <div>
            <p className="font-mono text-[9px] text-gray-500 uppercase">P1 Rate</p>
            <p className="font-mono text-sm tabular-nums" style={{ color: p1Faction?.accentColor }}>
              {(player1.economy?.productionRate || 0).toFixed(1)}/m
            </p>
          </div>
        </div>

        <div className="font-mono text-[10px] text-gray-600">
          {currentMap?.name}
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="font-mono text-[9px] text-gray-500 uppercase">P2 Rate</p>
            <p className="font-mono text-sm tabular-nums" style={{ color: p2Faction?.accentColor }}>
              {(player2.economy?.productionRate || 0).toFixed(1)}/m
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[9px] text-gray-500 uppercase">P2 Stockpile</p>
            <p className="font-mono text-sm tabular-nums" style={{ color: p2Faction?.accentColor }}>
              {Math.floor(player2.economy?.resources.assembled || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Pause overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/85 flex items-center justify-center z-50">
          <div className="text-center">
            <h2 className="font-mono text-3xl text-white mb-2 tracking-[0.2em]">PAUSED</h2>
            <p className="font-mono text-xs text-gray-500">Waiting for players to resume</p>
          </div>
        </div>
      )}
    </div>
  )
}

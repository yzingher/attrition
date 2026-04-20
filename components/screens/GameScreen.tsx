'use client'

import { useEffect, useRef } from 'react'
import { useGameStore } from '@/lib/store'
import { FACTIONS } from '@/game/data/factions'

export function GameScreen() {
  const { phase, player1, player2, matchClock, isPaused, setPhase, togglePause, endMatch } = useGameStore()
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const p1Faction = player1.faction ? FACTIONS[player1.faction] : null
  const p2Faction = player2.faction ? FACTIONS[player2.faction] : null

  // Game clock
  useEffect(() => {
    if (phase === 'briefing') {
      // Auto-advance from briefing after 5 seconds
      const t = setTimeout(() => setPhase('peacetime'), 5000)
      return () => clearTimeout(t)
    }
  }, [phase, setPhase])

  useEffect(() => {
    if ((phase === 'peacetime' || phase === 'combat') && !isPaused) {
      clockRef.current = setInterval(() => {
        useGameStore.setState((s) => {
          const newClock = s.matchClock + 1
          // Peacetime → combat at 3:30
          if (s.phase === 'peacetime' && newClock >= 210) {
            return { matchClock: newClock, phase: 'combat' }
          }
          // Game ends at 20:00
          if (newClock >= 1200) {
            return { matchClock: newClock, phase: 'post-match' }
          }
          return { matchClock: newClock }
        })
      }, 1000)
      return () => {
        if (clockRef.current) clearInterval(clockRef.current)
      }
    }
  }, [phase, isPaused])

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

  return (
    <div className="h-screen w-screen bg-surface flex flex-col relative">
      {/* Top bar */}
      <div className="h-10 border-b border-border flex items-center justify-between px-4 shrink-0">
        <span className="font-mono text-xs" style={{ color: p1Faction?.accentColor }}>
          P1: {p1Faction?.shortName}
        </span>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-gray-500 uppercase tracking-wider">
            {phaseLabel}
          </span>
          <span className="font-mono text-sm text-white tabular-nums">
            {formatTime(matchClock)}
          </span>
        </div>
        <span className="font-mono text-xs" style={{ color: p2Faction?.accentColor }}>
          {p2Faction?.shortName} :P2
        </span>
      </div>

      {/* Main game area */}
      <div className="flex-1 flex">
        {/* P1 HUD */}
        <div className="w-56 border-r border-border p-3 flex flex-col gap-2">
          <div className="font-mono text-[10px] text-gray-500 uppercase tracking-wider mb-2">
            Production
          </div>
          {['Raw Inputs', 'Components', 'Assembly', 'Energy', 'Human Cap'].map((node) => (
            <div key={node} className="border border-border p-2">
              <span className="font-mono text-[10px] text-gray-400">{node}</span>
              <div className="h-1 bg-border mt-1 rounded">
                <div className="h-full bg-accent/40 rounded" style={{ width: '0%' }} />
              </div>
            </div>
          ))}
          <div className="mt-auto border-t border-border pt-2">
            <div className="font-mono text-[10px] text-gray-500">Stockpile: 0</div>
            <div className="font-mono text-[10px] text-gray-500">Regen: 0/min</div>
          </div>
        </div>

        {/* Map canvas area */}
        <div className="flex-1 relative bg-[#080c10]">
          {/* Briefing overlay */}
          {phase === 'briefing' && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-surface/90">
              <div className="max-w-lg text-center">
                <h2 className="font-mono text-lg text-white mb-4">DOCTRINE BRIEFING</h2>
                <div className="grid grid-cols-2 gap-8 text-left">
                  <div>
                    <p className="font-mono text-xs text-accent mb-1">{p1Faction?.shortName}</p>
                    <p className="text-xs text-gray-400">{p1Faction?.doctrine}</p>
                    <p className="text-xs text-success mt-2">+ {p1Faction?.strength}</p>
                    <p className="text-xs text-danger mt-1">− {p1Faction?.weakness}</p>
                  </div>
                  <div>
                    <p className="font-mono text-xs text-warning mb-1">{p2Faction?.shortName}</p>
                    <p className="text-xs text-gray-400">{p2Faction?.doctrine}</p>
                    <p className="text-xs text-success mt-2">+ {p2Faction?.strength}</p>
                    <p className="text-xs text-danger mt-1">− {p2Faction?.weakness}</p>
                  </div>
                </div>
                <p className="mt-6 text-xs text-gray-600 font-mono">Starting in 5s...</p>
              </div>
            </div>
          )}

          {/* Phase transition indicator */}
          {phase === 'combat' && matchClock >= 210 && matchClock < 213 && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <span className="font-mono text-2xl text-danger animate-pulse tracking-wider">
                COMBAT PHASE
              </span>
            </div>
          )}

          {/* Placeholder map grid */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0,229,255,0.2) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,229,255,0.2) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-xs text-gray-700 uppercase">
              Map Canvas — Taiwan Strait
            </span>
          </div>
        </div>

        {/* P2 HUD */}
        <div className="w-56 border-l border-border p-3 flex flex-col gap-2">
          <div className="font-mono text-[10px] text-gray-500 uppercase tracking-wider mb-2">
            Production
          </div>
          {['Raw Inputs', 'Components', 'Assembly', 'Energy', 'Human Cap'].map((node) => (
            <div key={node} className="border border-border p-2">
              <span className="font-mono text-[10px] text-gray-400">{node}</span>
              <div className="h-1 bg-border mt-1 rounded">
                <div className="h-full bg-warning/40 rounded" style={{ width: '0%' }} />
              </div>
            </div>
          ))}
          <div className="mt-auto border-t border-border pt-2">
            <div className="font-mono text-[10px] text-gray-500">Stockpile: 0</div>
            <div className="font-mono text-[10px] text-gray-500">Regen: 0/min</div>
          </div>
        </div>
      </div>

      {/* Pause overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center">
            <h2 className="font-mono text-2xl text-white mb-4 tracking-wider">PAUSED</h2>
            <p className="font-mono text-xs text-gray-500">Press ESC to resume</p>
          </div>
        </div>
      )}
    </div>
  )
}

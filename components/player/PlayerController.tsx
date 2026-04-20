'use client'

import { useGameStore, FactionId } from '@/lib/store'
import { FACTIONS } from '@/game/data/factions'
import { PlayerFactionSelect } from './PlayerFactionSelect'
import { PlayerEconomyView } from './PlayerEconomyView'
import { PlayerPostMatch } from './PlayerPostMatch'

interface PlayerControllerProps {
  playerNum: 1 | 2
}

export function PlayerController({ playerNum }: PlayerControllerProps) {
  const phase = useGameStore((s) => s.phase)
  const player = useGameStore((s) => s[playerNum === 1 ? 'player1' : 'player2'])
  const accentColor = playerNum === 1 ? '#00e5ff' : '#ff6b35'

  if (phase === 'lobby' || (phase === 'faction-select' && !player.ready)) {
    return <PlayerFactionSelect playerNum={playerNum} accentColor={accentColor} />
  }

  if (phase === 'faction-select' && player.ready) {
    return (
      <div className="h-screen w-screen bg-surface flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-3 h-3 rounded-full mx-auto mb-4" style={{ backgroundColor: accentColor }} />
          <p className="font-mono text-sm text-white mb-2">
            {player.faction ? FACTIONS[player.faction].name : ''}
          </p>
          <p className="font-mono text-xs text-gray-500">Waiting for opponent...</p>
        </div>
      </div>
    )
  }

  if (phase === 'briefing') {
    const faction = player.faction ? FACTIONS[player.faction] : null
    return (
      <div className="h-screen w-screen bg-surface flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="font-mono text-lg text-white tracking-wider mb-4">BRIEFING</h2>
          <div className="border border-border p-4 text-left">
            <p className="font-mono text-xs mb-1" style={{ color: accentColor }}>{faction?.name}</p>
            <p className="text-[11px] text-gray-400 mb-3">{faction?.doctrine}</p>
            <p className="text-[11px] text-success">+ {faction?.strength}</p>
            <p className="text-[11px] text-danger mt-1">− {faction?.weakness}</p>
          </div>
          <p className="mt-6 text-[11px] text-gray-600 font-mono animate-pulse">Match starting...</p>
        </div>
      </div>
    )
  }

  if (phase === 'peacetime' || phase === 'combat') {
    return <PlayerEconomyView playerNum={playerNum} accentColor={accentColor} />
  }

  if (phase === 'post-match') {
    return <PlayerPostMatch playerNum={playerNum} accentColor={accentColor} />
  }

  return (
    <div className="h-screen w-screen bg-surface flex items-center justify-center p-6">
      <p className="font-mono text-xs text-gray-500">Connected as Player {playerNum}</p>
    </div>
  )
}

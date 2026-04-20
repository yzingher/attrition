'use client'

import { useGameStore } from '@/lib/store'
import { FACTIONS } from '@/game/data/factions'

interface PlayerPostMatchProps {
  playerNum: 1 | 2
  accentColor: string
}

export function PlayerPostMatch({ playerNum, accentColor }: PlayerPostMatchProps) {
  const player = useGameStore((s) => s[playerNum === 1 ? 'player1' : 'player2'])
  const opponent = useGameStore((s) => s[playerNum === 1 ? 'player2' : 'player1'])

  const economy = player.economy
  const opponentEcon = opponent.economy
  const faction = player.faction ? FACTIONS[player.faction] : null

  const myScore = (economy?.resources.assembled || 0) + (economy?.productionRate || 0) * 2
  const theirScore = (opponentEcon?.resources.assembled || 0) + (opponentEcon?.productionRate || 0) * 2
  const won = myScore > theirScore

  return (
    <div className="min-h-screen w-screen bg-surface flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="font-mono text-xl text-center text-white mb-2 tracking-wider">
          {won ? 'VICTORY' : myScore === theirScore ? 'DRAW' : 'DEFEAT'}
        </h1>
        <p className="font-mono text-[10px] text-center mb-8" style={{ color: accentColor }}>
          {faction?.name}
        </p>

        <div className="border border-border p-4 space-y-3 mb-6">
          <div className="flex justify-between font-mono text-xs">
            <span className="text-gray-500">Final Stockpile</span>
            <span className="text-white">{Math.floor(economy?.resources.assembled || 0)}</span>
          </div>
          <div className="flex justify-between font-mono text-xs">
            <span className="text-gray-500">Total Produced</span>
            <span className="text-white">{Math.floor(economy?.totalProduced || 0)}</span>
          </div>
          <div className="flex justify-between font-mono text-xs">
            <span className="text-gray-500">Peak Rate</span>
            <span className="text-white">{(economy?.peakProductionRate || 0).toFixed(1)}/min</span>
          </div>
          <div className="flex justify-between font-mono text-xs">
            <span className="text-gray-500">Attrition Score</span>
            <span className="text-white font-semibold">{Math.floor(myScore)}</span>
          </div>
        </div>

        <p className="font-mono text-[10px] text-gray-600 text-center">
          Look at the main screen for full match analytics
        </p>
      </div>
    </div>
  )
}

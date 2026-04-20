'use client'

import { useGameStore } from '@/lib/store'
import { DisplayLobby } from '@/components/display/DisplayLobby'
import { DisplayGame } from '@/components/display/DisplayGame'
import { DisplayPostMatch } from '@/components/display/DisplayPostMatch'

export default function Home() {
  const phase = useGameStore((s) => s.phase)

  switch (phase) {
    case 'lobby':
    case 'faction-select':
      return <DisplayLobby />
    case 'briefing':
    case 'peacetime':
    case 'combat':
      return <DisplayGame />
    case 'post-match':
      return <DisplayPostMatch />
    default:
      return <DisplayLobby />
  }
}

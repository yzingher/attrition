'use client'

import { useGameStore } from '@/lib/store'
import { TitleScreen } from '@/components/screens/TitleScreen'
import { FactionSelect } from '@/components/screens/FactionSelect'
import { GameScreen } from '@/components/screens/GameScreen'
import { PostMatch } from '@/components/screens/PostMatch'

export default function Home() {
  const phase = useGameStore((s) => s.phase)

  switch (phase) {
    case 'title':
      return <TitleScreen />
    case 'faction-select':
      return <FactionSelect />
    case 'briefing':
    case 'peacetime':
    case 'combat':
      return <GameScreen />
    case 'post-match':
      return <PostMatch />
    default:
      return <TitleScreen />
  }
}

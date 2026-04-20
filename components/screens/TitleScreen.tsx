'use client'

import { useGameStore } from '@/lib/store'

export function TitleScreen() {
  const setPhase = useGameStore((s) => s.setPhase)

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-surface relative">
      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,229,255,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,229,255,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Title */}
      <div className="relative z-10 text-center">
        <h1 className="text-7xl font-mono font-bold tracking-[0.3em] text-white mb-2">
          ATTRITION
        </h1>
        <p className="text-sm font-mono text-gray-500 tracking-widest uppercase mb-16">
          Production wins wars
        </p>

        {/* Menu */}
        <div className="flex flex-col gap-4 items-center">
          <button
            onClick={() => setPhase('faction-select')}
            className="px-12 py-3 border border-accent text-accent font-mono text-sm tracking-wider
                       hover:bg-accent hover:text-surface transition-all duration-150 uppercase"
          >
            Start Match
          </button>
          <button
            className="px-12 py-3 border border-border text-gray-500 font-mono text-sm tracking-wider
                       hover:border-gray-500 hover:text-gray-300 transition-all duration-150 uppercase
                       opacity-50 cursor-not-allowed"
            disabled
          >
            Tutorial
          </button>
        </div>

        {/* Footer */}
        <p className="mt-20 text-xs text-gray-600 font-mono">
          2 players &middot; same screen &middot; 20 minutes
        </p>
      </div>
    </div>
  )
}

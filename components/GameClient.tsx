'use client'
import Link from 'next/link'
import { useGameStore } from '@/stores/game'
import type { Scene, Choice } from '@/stores/game'

export default function GameClient({ initialScenes }: { initialScenes: Record<string, Scene> }) {
  const game = useGameStore()
  const scene: Scene | null = initialScenes[game.currentSceneId] ?? null

  function handleChoice(choice: Choice) {
    if (choice.effect) choice.effect(game)
    game.goToScene(choice.nextScene)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-8 text-amber-400 tracking-wide">Choose Your Adventure</h1>

        {scene ? (
          <div className="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800">
            <p className="text-lg leading-relaxed mb-8 text-gray-200">{scene.text}</p>
            <div className="flex flex-col gap-3">
              {scene.choices.map((choice, i) => (
                <button
                  key={i}
                  className="text-left px-5 py-3 rounded-xl bg-gray-800 hover:bg-amber-500 hover:text-gray-950 transition-colors duration-150 font-medium border border-gray-700 hover:border-amber-500"
                  onClick={() => handleChoice(choice)}
                >
                  {choice.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-red-400">
            Scene &quot;{game.currentSceneId}&quot; not found.
          </div>
        )}

        <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
          <span>Scene: {game.currentSceneId}</span>
          <div className="flex gap-4">
            <Link href="/admin" className="hover:text-gray-400 transition-colors">Admin</Link>
            <button className="hover:text-gray-400 transition-colors" onClick={() => game.reset()}>
              Restart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

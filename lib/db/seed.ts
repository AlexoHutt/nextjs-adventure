import { useDb } from './index'
import { scenes } from './schema'
import type { Scene } from '@/stores/game'
import rawScenes from '@/data/scenes.json'

let seeded = false

export function seedIfEmpty() {
  if (seeded) return
  const db = useDb()
  const existing = db.select().from(scenes).limit(1).all()
  if (existing.length > 0) { seeded = true; return }

  type SeedScene = Omit<Scene, 'title'> & { title?: string }
  const rows = Object.values(rawScenes as unknown as Record<string, SeedScene>).map((scene) => ({
    id:      scene.id,
    title:   scene.title ?? scene.id,
    text:    scene.text,
    choices: JSON.stringify(scene.choices),
  }))

  if (rows.length > 0) db.insert(scenes).values(rows).run()
  seeded = true
}

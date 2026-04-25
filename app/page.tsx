import { getDb } from '@/lib/db'
import { scenes as scenesTable } from '@/lib/db/schema'
import { seedIfEmpty } from '@/lib/db/seed'
import GameClient from '@/components/GameClient'
import type { Scene } from '@/stores/game'

export const dynamic = 'force-dynamic'

export default function Page() {
  seedIfEmpty()
  const db = getDb()
  const rows = db.select().from(scenesTable).all()

  const scenesMap: Record<string, Scene> = {}
  for (const row of rows) {
    scenesMap[row.id] = {
      id:      row.id,
      title:   row.title,
      text:    row.text,
      choices: JSON.parse(row.choices) as Scene['choices'],
    }
  }

  return <GameClient initialScenes={scenesMap} />
}

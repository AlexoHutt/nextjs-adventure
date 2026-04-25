import { NextRequest, NextResponse } from "next/server";
import { sql, notInArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { scenes, nodePositions } from "@/lib/db/schema";
import { seedIfEmpty } from "@/lib/db/seed";
import type { Scene } from "@/stores/game";

export function GET() {
  seedIfEmpty();
  const db = getDb();

  const sceneRows = db.select().from(scenes).all();
  const posRows = db.select().from(nodePositions).all();

  const scenesMap: Record<string, Scene> = {};
  for (const row of sceneRows) {
    scenesMap[row.id] = {
      id: row.id,
      title: row.title,
      text: row.text,
      choices: JSON.parse(row.choices) as Scene["choices"],
    };
  }

  const positionsMap: Record<string, { x: number; y: number }> = {};
  for (const row of posRows) {
    positionsMap[row.sceneId] = { x: row.x, y: row.y };
  }

  return NextResponse.json({ scenes: scenesMap, positions: positionsMap });
}

export async function PATCH(request: NextRequest) {
  const body = (await request.json()) as Record<string, Scene>;
  const db = getDb();

  const rows = Object.values(body).map((scene) => ({
    id: scene.id,
    title: scene.title,
    text: scene.text,
    choices: JSON.stringify(scene.choices),
  }));

  if (rows.length > 0) {
    db.insert(scenes)
      .values(rows)
      .onConflictDoUpdate({
        target: scenes.id,
        set: {
          title: sql`excluded.title`,
          text: sql`excluded.text`,
          choices: sql`excluded.choices`,
        },
      })
      .run();
  }

  const incomingIds = Object.keys(body);
  if (incomingIds.length > 0) {
    db.delete(scenes).where(notInArray(scenes.id, incomingIds)).run();
    db.delete(nodePositions)
      .where(notInArray(nodePositions.sceneId, incomingIds))
      .run();
  } else {
    db.delete(scenes).run();
    db.delete(nodePositions).run();
  }

  return NextResponse.json({ ok: true });
}

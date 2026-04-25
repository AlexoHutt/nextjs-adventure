import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { nodePositions } from "@/lib/db/schema";

interface PositionPayload {
  id: string;
  x: number;
  y: number;
}

export async function PATCH(request: NextRequest) {
  const { id, x, y } = (await request.json()) as PositionPayload;
  const db = getDb();

  db.insert(nodePositions)
    .values({ sceneId: id, x, y })
    .onConflictDoUpdate({
      target: nodePositions.sceneId,
      set: { x: sql`excluded.x`, y: sql`excluded.y` },
    })
    .run();

  return NextResponse.json({ ok: true });
}

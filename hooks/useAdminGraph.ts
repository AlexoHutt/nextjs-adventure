import { useMemo } from 'react'
import { useAdminStore } from '@/stores/admin'
import type { Node, Edge } from '@xyflow/react'

const SCENE_W = 240
const COL_GAP = 420
const ROW_GAP = 220

export function useAdminGraph() {
  const scenes = useAdminStore((s) => s.scenes)
  const positions = useAdminStore((s) => s.positions)

  const nodes = useMemo<Node[]>(() => {
    const { scenePos } = buildLayout(scenes)
    return Object.entries(scenes).map(([id, scene]) => {
      const stored = positions[id]
      const pos = stored ?? scenePos[id] ?? { x: 0, y: 0 }
      return {
        id: `scene:${id}`,
        type: 'sceneNode',
        position: { x: pos.x, y: pos.y },
        data: { id, text: scene.text },
        dragHandle: '.drag-handle',
        style: { width: SCENE_W },
      }
    })
  }, [scenes, positions])

  const edges = useMemo<Edge[]>(() => {
    const result: Edge[] = []
    for (const [id, scene] of Object.entries(scenes)) {
      scene.choices.forEach((choice, idx) => {
        if (choice.nextScene && scenes[choice.nextScene]) {
          result.push({
            id: `e-scene:${id}:${idx}-scene:${choice.nextScene}`,
            source: `scene:${id}`,
            sourceHandle: `choice:${idx}`,
            target: `scene:${choice.nextScene}`,
            type: 'smoothstep',
          })
        }
      })
    }
    return result
  }, [scenes])

  return { nodes, edges }
}

function buildLayout(scenes: Record<string, { choices: { nextScene: string }[] }>) {
  const depth: Record<string, number> = {}
  const queue = ['start']
  depth['start'] = 0

  while (queue.length > 0) {
    const id = queue.shift()!
    const scene = scenes[id]
    if (!scene) continue
    for (const choice of scene.choices) {
      if (choice.nextScene && !(choice.nextScene in depth)) {
        depth[choice.nextScene] = (depth[id] ?? 0) + 1
        queue.push(choice.nextScene)
      }
    }
  }

  const maxDepth = Math.max(0, ...Object.values(depth))
  for (const id of Object.keys(scenes)) {
    if (!(id in depth)) depth[id] = maxDepth + 1
  }

  const columns: Record<number, string[]> = {}
  for (const id of Object.keys(scenes)) {
    const col = depth[id] ?? 0
    ;(columns[col] ??= []).push(id)
  }

  const scenePos: Record<string, { x: number; y: number }> = {}
  for (const [colStr, ids] of Object.entries(columns)) {
    const col = Number(colStr)
    ids.forEach((id, row) => {
      scenePos[id] = { x: col * COL_GAP, y: row * ROW_GAP }
    })
  }

  return { scenePos }
}

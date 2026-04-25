import { create } from 'zustand'
import type { Scene } from './game'

interface AdminState {
  scenes: Record<string, Scene>
  positions: Record<string, { x: number; y: number }>
  loaded: boolean
}

interface AdminStore extends AdminState {
  fetchScenes: () => Promise<void>
  updatePosition: (id: string, x: number, y: number) => Promise<void>
  updateSceneTitle: (id: string, title: string) => void
  updateSceneText: (id: string, text: string) => void
  updateChoiceText: (sceneId: string, idx: number, text: string) => void
  updateChoiceTarget: (sceneId: string, idx: number, nextScene: string) => void
  removeChoice: (sceneId: string, idx: number) => void
  addChoice: (sceneId: string) => void
  deleteScene: (id: string) => Promise<void>
  addScene: () => void
  disconnectChoice: (sceneId: string, idx: number) => void
  renameScene: (oldId: string, newId: string) => void
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  scenes: {},
  positions: {},
  loaded: false,

  fetchScenes: async () => {
    if (get().loaded) return
    const data = await fetch('/api/scenes').then((r) => r.json()) as { scenes: Record<string, Scene>; positions: Record<string, { x: number; y: number }> }
    set({ scenes: data.scenes, positions: data.positions, loaded: true })
  },

  updatePosition: async (id, x, y) => {
    set((s) => ({ positions: { ...s.positions, [id]: { x, y } } }))
    await fetch('/api/positions', {
      method: 'PATCH',
      body: JSON.stringify({ id, x, y }),
      headers: { 'Content-Type': 'application/json' },
    })
  },

  updateSceneTitle: (id, title) => set((s) => {
    const scene = s.scenes[id]
    if (!scene) return s
    return { scenes: { ...s.scenes, [id]: { ...scene, title } } }
  }),

  updateSceneText: (id, text) => set((s) => {
    const scene = s.scenes[id]
    if (!scene) return s
    return { scenes: { ...s.scenes, [id]: { ...scene, text } } }
  }),

  updateChoiceText: (sceneId, idx, text) => set((s) => {
    const scene = s.scenes[sceneId]
    if (!scene) return s
    const choices = scene.choices.map((c, i) => i === idx ? { ...c, text } : c)
    return { scenes: { ...s.scenes, [sceneId]: { ...scene, choices } } }
  }),

  updateChoiceTarget: (sceneId, idx, nextScene) => set((s) => {
    const scene = s.scenes[sceneId]
    if (!scene) return s
    const choices = scene.choices.map((c, i) => i === idx ? { ...c, nextScene } : c)
    return { scenes: { ...s.scenes, [sceneId]: { ...scene, choices } } }
  }),

  removeChoice: (sceneId, idx) => set((s) => {
    const scene = s.scenes[sceneId]
    if (!scene) return s
    const choices = scene.choices.filter((_, i) => i !== idx)
    return { scenes: { ...s.scenes, [sceneId]: { ...scene, choices } } }
  }),

  addChoice: (sceneId) => set((s) => {
    const scene = s.scenes[sceneId]
    if (!scene) return s
    const choices = [...scene.choices, { text: 'New choice', nextScene: '' }]
    return { scenes: { ...s.scenes, [sceneId]: { ...scene, choices } } }
  }),

  deleteScene: async (id) => {
    set((s) => {
      const scenes = { ...s.scenes }
      delete scenes[id]
      const positions = { ...s.positions }
      delete positions[id]
      for (const scene of Object.values(scenes)) {
        scene.choices = scene.choices.map((c) =>
          c.nextScene === id ? { ...c, nextScene: '' } : c
        )
      }
      return { scenes, positions }
    })
    await fetch('/api/scenes', {
      method: 'PATCH',
      body: JSON.stringify(get().scenes),
      headers: { 'Content-Type': 'application/json' },
    })
  },

  addScene: () => set((s) => {
    const id = crypto.randomUUID()
    return { scenes: { ...s.scenes, [id]: { id, title: 'New Scene', text: '', choices: [] } } }
  }),

  disconnectChoice: (sceneId, idx) => set((s) => {
    const scene = s.scenes[sceneId]
    if (!scene) return s
    const choices = scene.choices.map((c, i) => i === idx ? { ...c, nextScene: '' } : c)
    return { scenes: { ...s.scenes, [sceneId]: { ...scene, choices } } }
  }),

  renameScene: (oldId, newId) => set((s) => {
    const trimmed = newId.trim()
    if (!trimmed || trimmed === oldId || s.scenes[trimmed]) return s
    const scene = s.scenes[oldId]
    if (!scene) return s
    const scenes = { ...s.scenes }
    scenes[trimmed] = { ...scene, id: trimmed }
    delete scenes[oldId]
    for (const sc of Object.values(scenes)) {
      sc.choices = sc.choices.map((c) =>
        c.nextScene === oldId ? { ...c, nextScene: trimmed } : c
      )
    }
    const positions = { ...s.positions }
    if (positions[oldId]) {
      positions[trimmed] = positions[oldId]!
      delete positions[oldId]
    }
    return { scenes, positions }
  }),
}))

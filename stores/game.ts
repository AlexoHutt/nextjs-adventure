import { create } from 'zustand'

export interface Choice {
  text: string
  nextScene: string
  condition?: (state: GameState) => boolean
  effect?: (state: GameState) => void
}

export interface Scene {
  id: string
  title: string
  text: string
  choices: Choice[]
}

export interface GameState {
  currentSceneId: string
  flags: Record<string, boolean>
  inventory: string[]
  stats: Record<string, number>
  history: string[]
}

interface GameStore extends GameState {
  goToScene: (sceneId: string) => void
  setFlag: (key: string, value?: boolean) => void
  addToInventory: (item: string) => void
  removeFromInventory: (item: string) => void
  setStat: (key: string, value: number) => void
  modifyStat: (key: string, delta: number) => void
  reset: () => void
}

const initialState: GameState = {
  currentSceneId: 'start',
  flags: {},
  inventory: [],
  stats: {},
  history: [],
}

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  goToScene: (sceneId) =>
    set((s) => ({ currentSceneId: sceneId, history: [...s.history, s.currentSceneId] })),

  setFlag: (key, value = true) =>
    set((s) => ({ flags: { ...s.flags, [key]: value } })),

  addToInventory: (item) =>
    set((s) => s.inventory.includes(item) ? s : { inventory: [...s.inventory, item] }),

  removeFromInventory: (item) =>
    set((s) => ({ inventory: s.inventory.filter((i) => i !== item) })),

  setStat: (key, value) =>
    set((s) => ({ stats: { ...s.stats, [key]: value } })),

  modifyStat: (key, delta) =>
    set((s) => ({ stats: { ...s.stats, [key]: (s.stats[key] ?? 0) + delta } })),

  reset: () => set(initialState),
}))

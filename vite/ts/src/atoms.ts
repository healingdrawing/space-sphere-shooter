import { atom, createStore } from 'jotai'

export const store = createStore()

export const ws_atom = atom<WebSocket | null>(null)

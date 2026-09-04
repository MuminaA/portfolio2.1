/**
 * A deliberately tiny achievement system. It exists because the site is meant
 * to feel like a game, and games reward poking at things.
 */
export type Toast = {
  key: number
  title: string
  note: string
}

const CATALOGUE: Record<string, { title: string; note: string }> = {
  'first-contact': { title: 'FIRST CONTACT', note: 'You disturbed the field.' },
  briefing: { title: 'MISSION BRIEFING', note: 'Opened a project dossier.' },
  'full-scan': { title: 'FULL SCAN', note: 'Reached the end of the transmission.' },
  keyboard: { title: 'KEYBOARD WARRIOR', note: 'Navigated without touching the mouse.' },
  konami: { title: 'OLD HABITS', note: '↑↑↓↓←→←→BA — palette unlocked.' },
}

export const TOTAL_ACHIEVEMENTS = Object.keys(CATALOGUE).length

const claimed = new Set<string>()
const listeners = new Set<(t: Toast) => void>()
const counters = new Set<(n: number) => void>()
let nextKey = 0

export function unlock(id: keyof typeof CATALOGUE | string) {
  const meta = CATALOGUE[id]
  if (!meta || claimed.has(id)) return
  claimed.add(id)
  const toast: Toast = { key: nextKey++, title: meta.title, note: meta.note }
  listeners.forEach((fn) => fn(toast))
  counters.forEach((fn) => fn(claimed.size))
}

export function onUnlock(fn: (t: Toast) => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function onCount(fn: (n: number) => void) {
  counters.add(fn)
  return () => {
    counters.delete(fn)
  }
}

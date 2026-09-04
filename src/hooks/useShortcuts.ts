import { useEffect } from 'react'
import { unlock } from '../lib/achievements'
import { scrollToSection } from '../lib/scroll'
import { tracker } from '../lib/tracker'

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]

/** Number keys jump between sections; the konami code flips the field palette. */
export function useShortcuts(ids: string[], enabled: boolean) {
  const key = ids.join('|')

  useEffect(() => {
    if (!enabled) return
    const sectionIds = key.split('|')
    let progress = 0

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const expected = KONAMI[progress]
      if (e.key === expected || e.key.toLowerCase() === expected) {
        progress++
        if (progress === KONAMI.length) {
          progress = 0
          tracker.palette = tracker.palette > 0.5 ? 0 : 1
          unlock('konami')
        }
      } else {
        progress = e.key === KONAMI[0] ? 1 : 0
      }

      // Match a literal digit only. Number(' ') is 0, so testing with Number()
      // would hijack the space bar and jump to the first section.
      if (/^[0-9]$/.test(e.key)) {
        const n = Number(e.key)
        if (n < sectionIds.length) {
          scrollToSection(sectionIds[n])
          unlock('keyboard')
        }
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [key, enabled])
}

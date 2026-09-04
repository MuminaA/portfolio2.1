/**
 * A module-level mutable store for high-frequency input (pointer, scroll, clicks).
 *
 * These values change every frame, so they deliberately live outside React —
 * the meadow, the petal trail and the palette loop all read them inside their
 * own animation loops and nothing re-renders.
 */
export type Tracker = {
  /** Raw pointer, normalised to -1..1 with +y up. */
  px: number
  py: number
  /** Smoothed pointer, eased toward the raw value each frame. */
  sx: number
  sy: number
  /** Pointer speed, 0..1-ish. Drives how hard the wind gusts. */
  speed: number
  /** Document scroll progress, 0..1. */
  scroll: number
  /** Scroll, smoothed. The single source of truth for the dusk → bloom arc. */
  bloom: number
  /** performance.now() of the last pointer press, for the gust ring. */
  clickAt: number
  /** True once the pointer has moved at least once (touch never sets this). */
  hasPointer: boolean
}

export const tracker: Tracker = {
  px: 0,
  py: 0.15,
  sx: 0,
  sy: 0.15,
  speed: 0,
  scroll: 0,
  bloom: 0,
  clickAt: -10_000,
  hasPointer: false,
}

let started = false

export function startTracking() {
  if (started) return
  started = true

  let lastX = 0
  let lastY = 0
  let lastT = performance.now()

  const onMove = (e: PointerEvent) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1
    const y = -((e.clientY / window.innerHeight) * 2 - 1)

    const now = performance.now()
    const dt = Math.max(now - lastT, 8) / 1000
    const travelled = Math.hypot(x - lastX, y - lastY)
    // Blend upward fast and decay slowly, so a flick of the wrist reads as a gust.
    tracker.speed = Math.min(1, Math.max(tracker.speed * 0.9, (travelled / dt) * 0.35))

    lastX = x
    lastY = y
    lastT = now

    tracker.px = x
    tracker.py = y
    tracker.hasPointer = true
  }

  const onDown = () => {
    tracker.clickAt = performance.now()
  }

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    tracker.scroll = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
  }

  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerdown', onDown, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  onScroll()
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * A module-level mutable store for high-frequency input (pointer, scroll, clicks).
 *
 * These values change every frame, so they deliberately live outside React —
 * the WebGL field and the HUD read them inside their own animation loops and
 * nothing re-renders.
 */
export type Tracker = {
  /** Raw pointer, normalised to -1..1 with +y up. */
  px: number
  py: number
  /** Smoothed pointer, eased toward the raw value each frame. */
  sx: number
  sy: number
  /** Document scroll progress, 0..1. */
  scroll: number
  /** performance.now() of the last pointer press, for the shockwave ripple. */
  clickAt: number
  /** Toggled by the konami easter egg; shifts the field palette. */
  palette: number
  /** True once the pointer has moved at least once (mobile never sets this). */
  hasPointer: boolean
}

export const tracker: Tracker = {
  px: 0,
  py: 0,
  sx: 0,
  sy: 0,
  scroll: 0,
  clickAt: -10_000,
  palette: 0,
  hasPointer: false,
}

let started = false

export function startTracking() {
  if (started) return
  started = true

  const onMove = (e: PointerEvent) => {
    tracker.px = (e.clientX / window.innerWidth) * 2 - 1
    tracker.py = -((e.clientY / window.innerHeight) * 2 - 1)
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

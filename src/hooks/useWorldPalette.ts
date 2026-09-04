import { useEffect } from 'react'
import { applyWorldVars } from '../lib/palette'
import { tracker } from '../lib/tracker'

/**
 * Eases raw scroll into `tracker.bloom` and pushes the world colours onto the
 * document as custom properties.
 *
 * This lives outside the WebGL layer on purpose: the sky and the sun are plain
 * CSS, so they have to bloom even before the lazily-loaded meadow arrives — and
 * `tracker.bloom` is the single value both the DOM and the shader read, so the
 * two can never disagree about how far into the arc we are.
 */
export function useWorldPalette() {
  useEffect(() => {
    let raf = 0
    let last = performance.now()

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 20)
      last = now

      // Framerate-independent exponential ease. Slow on purpose: the colour
      // should arrive behind you, not track the scrollbar.
      tracker.bloom += (tracker.scroll - tracker.bloom) * (1 - Math.pow(0.02, dt))
      applyWorldVars(tracker.bloom)

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
}

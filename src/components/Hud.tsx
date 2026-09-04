import { useEffect, useRef, useState } from 'react'
import { SECTIONS } from '../data/content'
import { onCount, TOTAL_ACHIEVEMENTS } from '../lib/achievements'
import { scrollToSection } from '../lib/scroll'
import { tracker } from '../lib/tracker'

type Props = { active: string }

/**
 * The fixed overlay chrome: corner brackets, telemetry readouts and section
 * navigation. Everything that ticks per-frame is written straight to the DOM
 * from one rAF loop rather than through React state.
 */
export default function Hud({ active }: Props) {
  const fpsRef = useRef<HTMLSpanElement>(null)
  const coordRef = useRef<HTMLSpanElement>(null)
  const progRef = useRef<HTMLDivElement>(null)
  const pctRef = useRef<HTMLSpanElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const [trophies, setTrophies] = useState(0)

  useEffect(() => onCount(setTrophies), [])

  useEffect(() => {
    let raf = 0
    let frames = 0
    let last = performance.now()

    const tick = (now: number) => {
      frames++
      if (now - last >= 500) {
        const fps = Math.round((frames * 1000) / (now - last))
        if (fpsRef.current) fpsRef.current.textContent = String(fps).padStart(3, '0')
        frames = 0
        last = now
      }

      if (coordRef.current) {
        const fmt = (v: number) => (v < 0 ? '' : '+') + v.toFixed(2)
        coordRef.current.textContent = `${fmt(tracker.px)} ${fmt(tracker.py)}`
      }

      const p = tracker.scroll
      if (progRef.current) progRef.current.style.transform = `scaleY(${p})`
      if (pctRef.current) pctRef.current.textContent = String(Math.round(p * 100)).padStart(3, '0')
      if (hintRef.current) hintRef.current.dataset.away = String(p > 0.03)

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="hud">
      <span className="hud__bracket hud__bracket--tl" />
      <span className="hud__bracket hud__bracket--tr" />
      <span className="hud__bracket hud__bracket--bl" />
      <span className="hud__bracket hud__bracket--br" />

      <div className="hud__topRight">
        <span className="hud__stat">
          <em>FPS</em>
          <span ref={fpsRef}>060</span>
        </span>
        <span className="hud__stat">
          <em>CURSOR</em>
          <span ref={coordRef}>+0.00 +0.00</span>
        </span>
        <span className="hud__stat">
          <em>TROPHIES</em>
          <span>
            {trophies}/{TOTAL_ACHIEVEMENTS}
          </span>
        </span>
      </div>

      <nav className="hud__nav" aria-label="Sections">
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className="hud__navItem"
            data-active={active === s.id}
            onClick={() => scrollToSection(s.id)}
          >
            <span className="hud__navKey">{i}</span>
            <span className="hud__navIndex">{s.index}</span>
            <span className="hud__navLabel">{s.label}</span>
          </button>
        ))}
      </nav>

      <div className="hud__progress" aria-hidden="true">
        <div className="hud__progressTrack">
          <div ref={progRef} className="hud__progressFill" />
        </div>
        <span ref={pctRef} className="hud__progressPct">
          000
        </span>
      </div>

      <div className="hud__hint" ref={hintRef}>
        <span className="hud__key">0–4</span> jump
        <span className="hud__sep">/</span>
        <span className="hud__key">move</span> disturb field
        <span className="hud__sep">/</span>
        <span className="hud__key">click</span> pulse
      </div>
    </div>
  )
}

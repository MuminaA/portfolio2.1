import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PLAYER } from '../data/content'
import { prefersReducedMotion } from '../lib/tracker'

const LINES: [string, string][] = [
  ['power on self test', 'OK'],
  ['mount /dev/portfolio', 'OK'],
  ['compile shaders', '4 STAGES'],
  ['spawn particle field', '26,880 NODES'],
  ['load player profile', PLAYER.handle.toUpperCase()],
  ['calibrate input', 'POINTER + KEYS'],
]

export default function Boot({ onDone }: { onDone: () => void }) {
  const reduced = prefersReducedMotion()
  const [revealed, setRevealed] = useState(reduced ? LINES.length : 0)
  const ready = revealed >= LINES.length

  useEffect(() => {
    if (ready) return
    const t = window.setTimeout(() => setRevealed((n) => n + 1), 160)
    return () => window.clearTimeout(t)
  }, [revealed, ready])

  // Any key or click leaves, at any point in the sequence — an impatient
  // visitor pressing a key wants to be let in, not told to wait.
  useEffect(() => {
    const go = () => onDone()
    window.addEventListener('keydown', go)
    window.addEventListener('pointerdown', go)
    return () => {
      window.removeEventListener('keydown', go)
      window.removeEventListener('pointerdown', go)
    }
  }, [onDone])

  const pct = Math.round((revealed / LINES.length) * 100)

  return (
    <motion.div
      className="boot"
      role="dialog"
      aria-label="Boot sequence"
      exit={{ opacity: 0, transition: { duration: 0.45 } }}
    >
      <div className="boot__inner">
        <div className="boot__brand">
          <span className="boot__sigil">◆</span>
          {PLAYER.name.replace(/ /g, '_')}.SYS
        </div>

        <ol className="boot__log">
          {LINES.map(([label, result], i) => (
            <li key={label} className="boot__line" data-shown={i < revealed}>
              <span className="boot__arrow">›</span>
              <span className="boot__label">{label}</span>
              <span className="boot__dots" aria-hidden="true" />
              <span className="boot__result">{result}</span>
            </li>
          ))}
        </ol>

        <div className="boot__meter">
          <div className="boot__meterFill" style={{ width: `${pct}%` }} />
        </div>
        <div className="boot__pct">
          {String(pct).padStart(3, '0')}%
          <span className="boot__pctNote">
            {ready ? 'system nominal' : 'initialising'}
          </span>
        </div>

        <button className="boot__enter" data-ready={ready} onClick={onDone} type="button">
          {ready ? 'press any key to continue' : 'standby'}
        </button>
      </div>

      <button className="boot__skip" onClick={onDone} type="button">
        skip [esc]
      </button>
    </motion.div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PROJECTS, SECTIONS } from '../data/content'
import type { Project } from '../data/content'
import Section from './Section'

const meta = SECTIONS[2]

function Scope({ level }: { level: number }) {
  return (
    <span className="scope" aria-label={`Scope ${level} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className="scope__petal" data-on={n <= level} aria-hidden="true" />
      ))}
    </span>
  )
}

function Opened({ project, onClose }: { project: Project; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)

    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.focus()

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <motion.div
      className="opened"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
    >
      <motion.div
        className="opened__panel"
        ref={panel}
        tabIndex={-1}
        initial={{ opacity: 0, y: 34 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 18, transition: { duration: 0.25 } }}
        transition={{ type: 'spring', stiffness: 180, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="opened__head">
          <div>
            <p className="opened__eyebrow">
              {project.year}
              <span className="opened__sep" aria-hidden="true" />
              {project.status}
            </p>
            <h3 className="opened__title">{project.title}</h3>
          </div>
          <button
            className="opened__close"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            <span aria-hidden="true" />
          </button>
        </header>

        <div className="opened__metrics">
          {project.metrics.map((m) => (
            <div className="metric" key={m.label}>
              <span className="metric__value">{m.value}</span>
              <span className="metric__label">{m.label}</span>
            </div>
          ))}
        </div>

        <div className="opened__body">
          {project.detail.map((para) => (
            <p key={para.slice(0, 24)}>{para}</p>
          ))}
        </div>

        <footer className="opened__foot">
          <ul className="tags">
            {project.stack.map((s) => (
              <li className="tag" key={s}>
                {s}
              </li>
            ))}
          </ul>

          <div className="opened__links">
            {project.links.map((l) => (
              <a
                className="pill"
                key={l.label}
                href={l.href}
                target={l.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                aria-disabled={l.href === '#'}
              >
                {l.label}
              </a>
            ))}
          </div>
        </footer>
      </motion.div>
    </motion.div>
  )
}

export default function Blooms() {
  const [open, setOpen] = useState<Project | null>(null)
  // Where focus goes back to when the panel closes.
  const opener = useRef<HTMLButtonElement | null>(null)

  const close = () => {
    setOpen(null)
    opener.current?.focus()
  }

  return (
    <Section meta={meta}>
      <div className="blooms">
        {PROJECTS.map((p, i) => (
          <motion.button
            type="button"
            className="bloom"
            key={p.id}
            onClick={(e) => {
              opener.current = e.currentTarget
              setOpen(p)
            }}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ delay: (i % 2) * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="bloom__glow" aria-hidden="true" />

            <header className="bloom__head">
              <span className="bloom__year">{p.year}</span>
              <span className="bloom__status" data-status={p.status}>
                {p.status}
              </span>
            </header>

            <h3 className="bloom__title">{p.title}</h3>
            <p className="bloom__blurb">{p.blurb}</p>

            <ul className="tags tags--compact">
              {p.stack.slice(0, 4).map((s) => (
                <li className="tag" key={s}>
                  {s}
                </li>
              ))}
            </ul>

            <footer className="bloom__foot">
              <Scope level={p.scope} />
              <span className="bloom__open">Open</span>
            </footer>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open ? <Opened project={open} onClose={close} /> : null}
      </AnimatePresence>
    </Section>
  )
}

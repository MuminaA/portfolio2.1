import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PROJECTS, SECTIONS } from '../data/content'
import type { Project } from '../data/content'
import { unlock } from '../lib/achievements'
import Section from './Section'

const meta = SECTIONS[2]

function Difficulty({ level }: { level: number }) {
  return (
    <span className="diff" title={`Difficulty ${level} of 5`}>
      <span className="diff__label">DIFF</span>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className="diff__pip" data-on={n <= level} />
      ))}
    </span>
  )
}

function Briefing({ project, onClose }: { project: Project; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)

    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <motion.div
      className="brief"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.codename} briefing`}
    >
      <motion.article
        className="brief__panel"
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.99, transition: { duration: 0.2 } }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="brief__head">
          <div>
            <span className="brief__eyebrow">
              MISSION BRIEFING / {project.year} / {project.status}
            </span>
            <h3 className="brief__codename">{project.codename}</h3>
            <p className="brief__title">{project.title}</p>
          </div>
          <button className="brief__close" onClick={onClose} type="button" aria-label="Close briefing">
            ✕
          </button>
        </header>

        <div className="brief__metrics">
          {project.metrics.map((m) => (
            <div className="brief__metric" key={m.label}>
              <span className="brief__metricValue">{m.value}</span>
              <span className="brief__metricLabel">{m.label}</span>
            </div>
          ))}
        </div>

        <div className="brief__body">
          {project.detail.map((para) => (
            <p key={para.slice(0, 24)}>{para}</p>
          ))}
        </div>

        <footer className="brief__foot">
          <ul className="tags">
            {project.stack.map((s) => (
              <li className="tag" key={s}>
                {s}
              </li>
            ))}
          </ul>

          <div className="brief__links">
            {project.links.map((l) => (
              <a
                className="btn btn--small"
                key={l.label}
                href={l.href}
                target={l.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                aria-disabled={l.href === '#'}
              >
                <span>{l.label}</span>
                <span className="btn__arrow">↗</span>
              </a>
            ))}
          </div>
        </footer>
      </motion.article>
    </motion.div>
  )
}

export default function Missions() {
  const [open, setOpen] = useState<Project | null>(null)

  const openBriefing = (p: Project) => {
    setOpen(p)
    unlock('briefing')
  }

  return (
    <Section
      id={meta.id}
      index={meta.index}
      label={meta.label}
      title="Things I built and what they cost"
      lede="Four projects, opened up. Click any card for the full briefing — including the parts that went badly."
    >
      <div className="missions">
        {PROJECTS.map((p, i) => (
          <motion.button
            type="button"
            className="mission"
            key={p.id}
            onClick={() => openBriefing(p)}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ delay: (i % 2) * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="mission__bracket mission__bracket--tl" />
            <span className="mission__bracket mission__bracket--br" />

            <header className="mission__head">
              <span className="mission__index">{String(i + 1).padStart(2, '0')}</span>
              <span className="mission__status" data-status={p.status}>
                {p.status}
              </span>
            </header>

            <h3 className="mission__codename">{p.codename}</h3>
            <p className="mission__title">{p.title}</p>
            <p className="mission__blurb">{p.blurb}</p>

            <ul className="tags tags--compact">
              {p.stack.slice(0, 4).map((s) => (
                <li className="tag" key={s}>
                  {s}
                </li>
              ))}
            </ul>

            <footer className="mission__foot">
              <Difficulty level={p.difficulty} />
              <span className="mission__open">
                OPEN BRIEFING <span className="btn__arrow">→</span>
              </span>
            </footer>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open ? <Briefing project={open} onClose={() => setOpen(null)} /> : null}
      </AnimatePresence>
    </Section>
  )
}

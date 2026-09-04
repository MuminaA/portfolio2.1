import { motion } from 'framer-motion'
import { ME, SECTIONS } from '../data/content'
import { scrollToSection } from '../lib/scroll'

const meta = SECTIONS[0]

/**
 * The hero. No panel, no border, no boot sequence — just type over the meadow,
 * arriving slowly enough that the first thing you notice is the wind.
 */
export default function Drift() {
  return (
    <section id={meta.id} className="drift" data-scheme={meta.scheme}>
      <div className="drift__inner">
        <motion.p
          className="drift__role"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {ME.role}
        </motion.p>

        <motion.h1
          className="drift__name"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {ME.name}
        </motion.h1>

        <motion.p
          className="drift__tagline"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {ME.tagline}
        </motion.p>

        <motion.p
          className="drift__meta"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.95, duration: 1.4 }}
        >
          <span>{ME.location}</span>
          <span className="drift__dot" aria-hidden="true" />
          <span>{ME.status}</span>
        </motion.p>
      </div>

      <motion.div
        className="drift__foot"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1.6 }}
      >
        <p className="drift__hint">{meta.lede}</p>
        <button
          type="button"
          className="drift__onward"
          onClick={() => scrollToSection(SECTIONS[1].id)}
        >
          <span>Drift down</span>
          <span className="drift__arrow" aria-hidden="true" />
        </button>
      </motion.div>
    </section>
  )
}

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { Section as SectionMeta } from '../data/content'

type Props = { meta: SectionMeta; children: ReactNode }

/**
 * `data-scheme` is what keeps the copy readable. The world behind the page runs
 * a continuous dusk→bloom gradient, so at some point light text on dark has to
 * become dark text on light. Interpolating that continuously would drag both
 * through mid-grey at the same moment and contrast would collapse, so instead
 * each section declares its own scheme and the switch happens between sections.
 */
export default function Section({ meta, children }: Props) {
  return (
    <section id={meta.id} className="section" data-scheme={meta.scheme}>
      <motion.header
        className="section__head"
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15% 0px' }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="section__plain">{meta.plain}</p>
        <h2 className="section__title">{meta.title}</h2>
        <p className="section__lede">{meta.lede}</p>
      </motion.header>

      <div className="section__body">{children}</div>
    </section>
  )
}

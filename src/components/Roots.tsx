import { motion } from 'framer-motion'
import { HISTORY, ME, SECTIONS } from '../data/content'
import Section from './Section'

const meta = SECTIONS[3]

/** Bio, then history as a vine: one stem down the left with a bud per season. */
export default function Roots() {
  return (
    <Section meta={meta}>
      <div className="roots">
        <div className="roots__bio">
          {ME.bio.map((para, i) => (
            <motion.p
              key={para.slice(0, 24)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-12% 0px' }}
              transition={{ delay: i * 0.12, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            >
              {para}
            </motion.p>
          ))}
        </div>

        <ol className="vine">
          {HISTORY.map((season, i) => (
            <motion.li
              className="vine__season"
              key={season.period}
              initial={{ opacity: 0, x: -14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ delay: i * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="vine__bud" aria-hidden="true" />
              <p className="vine__period">{season.period}</p>
              <h3 className="vine__org">{season.org}</h3>
              <p className="vine__role">{season.role}</p>
              <p className="vine__note">{season.note}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </Section>
  )
}

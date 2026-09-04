import { motion } from 'framer-motion'
import { LINKS, ME, SECTIONS } from '../data/content'
import Section from './Section'

const meta = SECTIONS[4]

export default function Reach() {
  return (
    <Section meta={meta}>
      <ul className="reach">
        {LINKS.map((link, i) => {
          const inert = link.href === '#'
          return (
            <motion.li
              key={link.label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ delay: i * 0.08, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <a
                className="reach__link"
                href={link.href}
                aria-disabled={inert}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
              >
                <span className="reach__label">{link.label}</span>
                <span className="reach__value">{link.value}</span>
                <span className="reach__petal" aria-hidden="true" />
              </a>
            </motion.li>
          )
        })}
      </ul>

      <p className="reach__close">
        {ME.name}
        <span className="reach__dot" aria-hidden="true" />
        {ME.location}
      </p>
    </Section>
  )
}

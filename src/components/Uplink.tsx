import { motion } from 'framer-motion'
import { LINKS, PLAYER, SECTIONS } from '../data/content'
import Section from './Section'

const meta = SECTIONS[4]

export default function Uplink() {
  return (
    <Section
      id={meta.id}
      index={meta.index}
      label={meta.label}
      title="Say something"
      lede="Hiring, arguing about netcode, or sending me a shader you are proud of — all welcome."
    >
      <ul className="uplink">
        {LINKS.map((link, i) => {
          const dead = link.href === '#'
          return (
            <motion.li
              key={link.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: 'easeOut' }}
            >
              <a
                className="uplink__row"
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                data-dead={dead}
              >
                <span className="uplink__label">{link.label}</span>
                <span className="uplink__value">{link.value}</span>
                <span className="uplink__arrow">→</span>
              </a>
            </motion.li>
          )
        })}
      </ul>

      <footer className="footer">
        <span>
          © {new Date().getFullYear()} {PLAYER.name}
        </span>
        <span className="footer__mid">
          built with react, three.js and a shader that runs on your GPU right now
        </span>
        <span className="footer__hint">try ↑↑↓↓←→←→BA</span>
      </footer>
    </Section>
  )
}

import { motion } from 'framer-motion'
import { SECTIONS, STAT_GROUPS } from '../data/content'
import Section from './Section'

const meta = SECTIONS[1]

export default function Loadout() {
  return (
    <Section
      id={meta.id}
      index={meta.index}
      label={meta.label}
      title="What I actually reach for"
      lede="Self-assessed, and deliberately not all maxed out. The bars I am least proud of are the honest ones."
    >
      <div className="loadout">
        {STAT_GROUPS.map((group) => (
          <div className="loadout__group" key={group.title}>
            <h3 className="loadout__groupTitle">
              <span className="loadout__groupBar" />
              {group.title}
            </h3>

            <ul className="loadout__list">
              {group.stats.map((stat, i) => (
                <motion.li
                  className="stat"
                  key={stat.label}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10% 0px' }}
                  transition={{ delay: i * 0.07, duration: 0.5, ease: 'easeOut' }}
                >
                  <div className="stat__row">
                    <span className="stat__label">{stat.label}</span>
                    <span className="stat__level">{stat.level}</span>
                  </div>

                  <div className="stat__track">
                    <motion.div
                      className="stat__fill"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: stat.level / 100 }}
                      viewport={{ once: true, margin: '-10% 0px' }}
                      transition={{ delay: 0.1 + i * 0.07, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    />
                    <span className="stat__ticks" aria-hidden="true" />
                  </div>

                  <p className="stat__detail">{stat.detail}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  )
}

import { motion } from 'framer-motion'
import { SECTIONS, SKILL_GROUPS } from '../data/content'
import Section from './Section'

const meta = SECTIONS[1]

/**
 * Skills as a garden bed: each one is a stem that grows to its level when it
 * scrolls into view, with a bud at the tip. The number is still there for
 * anyone who wants it, but the row reads as a shape first.
 */
export default function Growth() {
  return (
    <Section meta={meta}>
      <div className="garden">
        {SKILL_GROUPS.map((group) => (
          <div className="bed" key={group.title}>
            <h3 className="bed__title">{group.title}</h3>

            <div className="bed__stems">
              {group.skills.map((skill, i) => (
                <div className="stem" key={skill.label}>
                  <div className="stem__plot">
                    <motion.div
                      className="stem__stalk"
                      initial={{ height: '4%' }}
                      whileInView={{ height: `${skill.level}%` }}
                      viewport={{ once: true, margin: '-10% 0px' }}
                      transition={{
                        delay: 0.1 + i * 0.12,
                        duration: 1.6,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <span className="stem__leaf" aria-hidden="true" />
                      <span className="stem__bud" aria-hidden="true" />
                    </motion.div>
                  </div>

                  {/* The caption sits low in the frame, where the meadow is
                      busiest — it needs a veil, not just a halo, to stay read. */}
                  <div className="stem__card">
                    <p className="stem__label">
                      {skill.label}
                      <span className="stem__level">{skill.level}</span>
                    </p>
                    <p className="stem__detail">{skill.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

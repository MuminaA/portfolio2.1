import { motion } from 'framer-motion'
import { PLAYER, RUNS, SECTIONS } from '../data/content'
import Section from './Section'

const meta = SECTIONS[3]

const ATTRS = [
  { label: 'CLASS', value: PLAYER.role },
  { label: 'BASE', value: PLAYER.location },
  { label: 'STATUS', value: PLAYER.status },
  { label: 'HANDLE', value: `@${PLAYER.handle}` },
]

export default function Profile() {
  return (
    <Section
      id={meta.id}
      index={meta.index}
      label={meta.label}
      title="The person behind the cursor"
    >
      <div className="profile">
        <motion.div
          className="profile__bio"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {PLAYER.bio.map((para) => (
            <p key={para.slice(0, 24)}>{para}</p>
          ))}

          <dl className="attrs">
            {ATTRS.map((a) => (
              <div className="attrs__row" key={a.label}>
                <dt>{a.label}</dt>
                <dd>{a.value}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.ol
          className="runs"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h3 className="runs__title">
            <span className="loadout__groupBar" />
            RUN HISTORY
          </h3>

          {RUNS.map((run) => (
            <li className="run" key={run.period}>
              <span className="run__node" />
              <span className="run__period">{run.period}</span>
              <span className="run__org">{run.org}</span>
              <span className="run__role">{run.role}</span>
              <p className="run__note">{run.note}</p>
            </li>
          ))}
        </motion.ol>
      </div>
    </Section>
  )
}

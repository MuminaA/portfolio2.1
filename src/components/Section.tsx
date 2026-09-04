import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

type Props = {
  id: string
  index: string
  label: string
  title: string
  lede?: string
  children: ReactNode
}

export default function Section({ id, index, label, title, lede, children }: Props) {
  return (
    <section id={id} className="section">
      <motion.header
        className="section__head"
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15% 0px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="section__eyebrow">
          <span className="section__index">{index}</span>
          <span className="section__label">{label}</span>
          <span className="section__rule" />
        </div>
        <h2 className="section__title">{title}</h2>
        {lede ? <p className="section__lede">{lede}</p> : null}
      </motion.header>

      <div className="section__body">{children}</div>
    </section>
  )
}

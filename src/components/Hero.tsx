import { motion } from 'framer-motion'
import { PLAYER, SECTIONS } from '../data/content'
import { scrollToSection } from '../lib/scroll'

const rise = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.12 * i, duration: 0.75, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

export default function Hero() {
  return (
    <section id={SECTIONS[0].id} className="hero">
      <div className="hero__inner">
        <motion.div className="hero__meta" variants={rise} initial="hidden" animate="show" custom={0}>
          <span className="hero__status">
            <span className="hero__pip" />
            {PLAYER.status}
          </span>
          <span className="hero__divider" />
          <span>{PLAYER.location}</span>
        </motion.div>

        <motion.h1
          className="hero__name"
          data-text={PLAYER.name}
          variants={rise}
          initial="hidden"
          animate="show"
          custom={1}
        >
          {PLAYER.name}
        </motion.h1>

        <motion.div className="hero__role" variants={rise} initial="hidden" animate="show" custom={2}>
          <span className="hero__roleRule" />
          {PLAYER.role}
        </motion.div>

        <motion.p className="hero__tagline" variants={rise} initial="hidden" animate="show" custom={3}>
          {PLAYER.tagline}
        </motion.p>

        <motion.div className="hero__cta" variants={rise} initial="hidden" animate="show" custom={4}>
          <button className="btn btn--primary" type="button" onClick={() => scrollToSection('missions')}>
            <span>VIEW MISSIONS</span>
            <span className="btn__arrow">→</span>
          </button>
          <button className="btn" type="button" onClick={() => scrollToSection('uplink')}>
            <span>OPEN UPLINK</span>
          </button>
        </motion.div>
      </div>

      <motion.div
        className="hero__scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        <span className="hero__scrollLine" />
        scroll
      </motion.div>
    </section>
  )
}

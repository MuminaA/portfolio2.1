import { lazy, Suspense, useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Achievements from './components/Achievements'
import Boot from './components/Boot'
import Hero from './components/Hero'
import Hud from './components/Hud'
import Loadout from './components/Loadout'
import Missions from './components/Missions'
import Profile from './components/Profile'
import Uplink from './components/Uplink'
import { SECTIONS } from './data/content'
import { useActiveSection } from './hooks/useActiveSection'
import { useShortcuts } from './hooks/useShortcuts'
import { unlock } from './lib/achievements'
import { startTracking, tracker } from './lib/tracker'

const IDS = SECTIONS.map((s) => s.id)

// three.js is ~900kB of the bundle. Deferring it lets the boot sequence paint
// immediately and downloads the renderer while the user reads the log.
const Field = lazy(() => import('./components/Field'))

export default function App() {
  // The boot sequence is a first-impression, not a toll booth — once per tab.
  const [booted, setBooted] = useState(
    () => sessionStorage.getItem('booted') === '1',
  )

  const active = useActiveSection(IDS)
  useShortcuts(IDS, booted)

  useEffect(() => {
    startTracking()
  }, [])

  useEffect(() => {
    document.body.classList.toggle('is-booting', !booted)
  }, [booted])

  useEffect(() => {
    if (!booted) return

    const onDown = () => unlock('first-contact')
    const onScroll = () => {
      if (tracker.scroll > 0.98) unlock('full-scan')
    }

    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('scroll', onScroll)
    }
  }, [booted])

  const finishBoot = () => {
    sessionStorage.setItem('booted', '1')
    setBooted(true)
  }

  return (
    <>
      <Suspense fallback={null}>
        <Field />
      </Suspense>
      <div className="overlay overlay--scan" aria-hidden="true" />
      <div className="overlay overlay--vignette" aria-hidden="true" />

      <AnimatePresence>{!booted ? <Boot onDone={finishBoot} /> : null}</AnimatePresence>

      <Hud active={active} />
      <Achievements />

      <main className="main" data-live={booted}>
        <Hero />
        <Loadout />
        <Missions />
        <Profile />
        <Uplink />
      </main>
    </>
  )
}

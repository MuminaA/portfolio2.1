import { lazy, Suspense, useEffect } from 'react'
import Blooms from './components/Blooms'
import Drift from './components/Drift'
import Growth from './components/Growth'
import Nav from './components/Nav'
import Reach from './components/Reach'
import Roots from './components/Roots'
import Sky from './components/Sky'
import { SECTIONS } from './data/content'
import { useActiveSection } from './hooks/useActiveSection'
import { useWorldPalette } from './hooks/useWorldPalette'
import { startTracking } from './lib/tracker'

const IDS = SECTIONS.map((s) => s.id)

// three.js is the large majority of the bundle. Deferring it lets the sky, the
// sun and the first screen of type paint immediately, and the meadow fades in
// underneath them a moment later.
const Field = lazy(() => import('./components/Field'))

export default function App() {
  const active = useActiveSection(IDS)
  useWorldPalette()

  useEffect(() => {
    startTracking()
  }, [])

  return (
    <>
      <Sky />
      <Suspense fallback={null}>
        <Field />
      </Suspense>
      <div className="grain" aria-hidden="true" />

      <Nav active={active} />

      <main className="main">
        <Drift />
        <Growth />
        <Blooms />
        <Roots />
        <Reach />
      </main>
    </>
  )
}

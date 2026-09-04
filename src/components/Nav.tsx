import { SECTIONS } from '../data/content'
import { scrollToSection } from '../lib/scroll'

type Props = { active: string }

/**
 * The only chrome left on the page: five dots.
 *
 * Flower has no HUD at all, so this is the smallest thing that still lets
 * someone navigate. Labels stay hidden until hover or keyboard focus — the
 * accessible name is always on the button, so nothing is lost to a screen
 * reader by keeping them out of sight.
 */
export default function Nav({ active }: Props) {
  return (
    <nav className="nav" aria-label="Sections">
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          type="button"
          className="nav__dot"
          data-active={active === s.id}
          aria-current={active === s.id ? 'true' : undefined}
          onClick={() => scrollToSection(s.id)}
        >
          <span className="nav__mark" aria-hidden="true" />
          <span className="nav__label">{s.plain}</span>
        </button>
      ))}
    </nav>
  )
}

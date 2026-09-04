import { useEffect, useState } from 'react'

/**
 * Reports which section currently occupies the middle band of the viewport.
 * The negative rootMargin shrinks the observation area to a thin horizontal
 * strip, so exactly one section is "active" at a time.
 */
export function useActiveSection(ids: string[]) {
  const key = ids.join('|')
  const [active, setActive] = useState(ids[0] ?? '')

  useEffect(() => {
    const els = key
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (els.length === 0) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )

    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [key])

  return active
}

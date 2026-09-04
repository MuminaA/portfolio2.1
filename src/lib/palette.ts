/**
 * The dusk → bloom arc.
 *
 * Flower's whole shape is the return of colour: you begin in something drained
 * and grey and end in full light. Here that arc is bound to scroll — the top of
 * the page is dormant dusk, the bottom is full bloom.
 *
 * Three stops rather than two, because a straight dusk→bloom line passes through
 * muddy olive in the middle. The dawn stop routes it through warm rose instead.
 *
 * Text colour is deliberately NOT interpolated here — see the note in index.css.
 */

export const COLOR_KEYS = [
  'skyTop',
  'skyMid',
  'skyLow',
  'sun',
  'haze',
  'grassBase',
  'grassTip',
  'petal',
  'petalLight',
] as const

export type ColorKey = (typeof COLOR_KEYS)[number]

type Stop = { at: number; colors: Record<ColorKey, string> }

export const STOPS: Stop[] = [
  {
    // 0.00 — dormant. Overcast, colourless, everything holding its breath.
    at: 0,
    colors: {
      skyTop: '#1e2530',
      skyMid: '#333c4a',
      skyLow: '#5a6474',
      sun: '#7d8996',
      haze: '#4c5665',
      grassBase: '#2b3634',
      grassTip: '#57655c',
      petal: '#95a0ac',
      petalLight: '#ccd4dd',
    },
  },
  {
    // 0.55 — dawn. The turn: light arrives low and warm before it arrives bright.
    at: 0.55,
    colors: {
      skyTop: '#4a5472',
      skyMid: '#8d7e93',
      skyLow: '#dda27c',
      sun: '#ffb877',
      haze: '#b3907f',
      grassBase: '#4a5a45',
      grassTip: '#8ba455',
      petal: '#f2a8ae',
      petalLight: '#ffdac9',
    },
  },
  {
    // 1.00 — full bloom. Open sky, warm horizon, saturated meadow.
    at: 1,
    colors: {
      skyTop: '#8fc6e8',
      skyMid: '#c3e2ef',
      skyLow: '#ffd9a8',
      sun: '#ffcf5c',
      haze: '#ffe3b8',
      grassBase: '#4f8033',
      grassTip: '#b9db5e',
      petal: '#ff9fb8',
      petalLight: '#ffe2ec',
    },
  },
]

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const toHex = (v: number) => Math.round(v).toString(16).padStart(2, '0')

/** Linear blend of two hex colours in sRGB — which is what CSS wants. */
export function mixHex(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a)
  const [r2, g2, b2] = hexToRgb(b)
  const k = Math.min(1, Math.max(0, t))
  return `#${toHex(r1 + (r2 - r1) * k)}${toHex(g1 + (g2 - g1) * k)}${toHex(b1 + (b2 - b1) * k)}`
}

/**
 * Which pair of stops surrounds `t`, and how far between them we are.
 * Shared by the CSS variables and the shader uniforms so the DOM and the WebGL
 * layer can never drift apart.
 */
export function segmentAt(t: number): { lo: number; hi: number; u: number } {
  const k = Math.min(1, Math.max(0, t))
  for (let i = 0; i < STOPS.length - 1; i++) {
    const a = STOPS[i]
    const b = STOPS[i + 1]
    if (k <= b.at || i === STOPS.length - 2) {
      const span = b.at - a.at
      return { lo: i, hi: i + 1, u: span > 0 ? Math.min(1, (k - a.at) / span) : 0 }
    }
  }
  return { lo: 0, hi: 1, u: 0 }
}

/** The blended value of one colour key at arc position `t`. */
export function colorAt(key: ColorKey, t: number): string {
  const { lo, hi, u } = segmentAt(t)
  return mixHex(STOPS[lo].colors[key], STOPS[hi].colors[key], u)
}

let lastApplied = -1

/**
 * Pushes the world colours onto the document as custom properties. The sky
 * gradient and the sun are plain CSS, so they bloom for free alongside the
 * shader without costing a draw call.
 */
export function applyWorldVars(t: number) {
  // Quantised: the eye cannot see a 1/500th step and this skips most writes.
  const q = Math.round(t * 500) / 500
  if (q === lastApplied) return
  lastApplied = q

  const root = document.documentElement.style
  for (const key of COLOR_KEYS) {
    root.setProperty(`--${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`, colorAt(key, q))
  }
  // The sun climbs and brightens as the field blooms.
  root.setProperty('--sun-y', `${68 - q * 22}%`)
  root.setProperty('--sun-opacity', String(0.25 + q * 0.6))
  root.setProperty('--bloom', String(q))
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * EDIT THIS FILE. It is the only file you need to touch to make the site yours.
 * Everything marked PLACEHOLDER is invented copy — swap it for the real thing.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type Section = {
  id: string
  /** The large, quiet heading. */
  title: string
  /** The plain word for the same thing — used for the nav label and screen readers. */
  plain: string
  /** One line under the heading. Keep it short; the page is meant to breathe. */
  lede: string
  /**
   * Which text scheme this section uses. The world behind the page blooms
   * continuously from dusk to daylight, so the copy has to invert somewhere —
   * it steps per section, between sections, where no text is mid-read.
   */
  scheme: 'dusk' | 'dawn' | 'light'
}

export const SECTIONS: Section[] = [
  {
    id: 'drift',
    title: 'Drift',
    plain: 'Home',
    // Reads true on a phone as well as a mouse — the wind wanders on its own
    // when there is no pointer, so the flowers still open.
    lede: 'Flowers open where you pass. Scroll, and the field comes into bloom.',
    scheme: 'dusk',
  },
  {
    id: 'growth',
    title: 'Growth',
    plain: 'Skills',
    // PLACEHOLDER
    lede: 'What I reach for, and roughly how far along each one is.',
    scheme: 'dusk',
  },
  {
    id: 'blooms',
    title: 'Blooms',
    plain: 'Projects',
    // PLACEHOLDER
    lede: 'Four things I built. Open any one for the whole story, including the parts that went badly.',
    scheme: 'dawn',
  },
  {
    id: 'roots',
    title: 'Roots',
    plain: 'About',
    // PLACEHOLDER
    lede: 'Where this came from.',
    scheme: 'light',
  },
  {
    id: 'reach',
    title: 'Reach',
    plain: 'Contact',
    // PLACEHOLDER
    lede: 'Open to interesting work. The inbox is quiet and I answer it.',
    scheme: 'light',
  },
]

export const ME = {
  // PLACEHOLDER — your name, exactly as you want it rendered large.
  name: 'Mina Abdi',
  role: 'Software Engineer',
  // PLACEHOLDER — one line, no fluff. This sits under your name.
  tagline: 'I build systems that hold up under load, and interfaces that feel alive.',
  location: 'London, UK',
  status: 'Open to work',
  // PLACEHOLDER — 2–3 sentences. Written like a person, not a CV.
  bio: [
    'I am a software engineer drawn to the unglamorous half of the job: the failure modes, the p99, the migration nobody wants to own. I got here through games — spending my teens taking mods apart taught me to read a system before trusting it.',
    'These days the work is mostly backend services and developer tooling, and I keep a graphics side-project running at all times so the fun never fully leaves it.',
  ],
}

/** A skill, drawn as a stem. `level` is 0–100 and is yours to be honest about. */
export type Skill = {
  label: string
  level: number
  detail: string
}

export type SkillGroup = {
  title: string
  skills: Skill[]
}

// PLACEHOLDER — replace with what you actually use.
export const SKILL_GROUPS: SkillGroup[] = [
  {
    title: 'Languages',
    skills: [
      { label: 'TypeScript', level: 92, detail: 'Daily driver. Strict mode, no exceptions.' },
      { label: 'Python', level: 84, detail: 'Services, tooling, data plumbing.' },
      { label: 'Java', level: 76, detail: 'Large backend codebases, Spring.' },
      { label: 'Rust', level: 48, detail: 'Learning in public. CLI tools, WASM.' },
    ],
  },
  {
    title: 'Systems',
    skills: [
      { label: 'AWS', level: 88, detail: 'Lambda, DynamoDB, ECS, IAM the hard way.' },
      { label: 'Distributed design', level: 80, detail: 'Queues, idempotency, backpressure.' },
      { label: 'Postgres', level: 78, detail: 'Query plans, indexes, migrations.' },
      { label: 'Observability', level: 74, detail: 'Dashboards that answer questions.' },
    ],
  },
  {
    title: 'Craft',
    skills: [
      { label: 'React', level: 90, detail: 'Including the parts that re-render too much.' },
      { label: 'WebGL / GLSL', level: 70, detail: 'Shaders, particle systems, this page.' },
      { label: 'Interaction design', level: 68, detail: 'Motion with a reason to exist.' },
    ],
  },
]

export type Project = {
  id: string
  title: string
  year: string
  status: 'Shipped' | 'Live' | 'Growing' | 'Dormant'
  /** Rough scope, 1–5. Drawn as a small row of petals. */
  scope: 1 | 2 | 3 | 4 | 5
  blurb: string
  /** Shown when the project opens. One paragraph per entry. */
  detail: string[]
  stack: string[]
  metrics: { label: string; value: string }[]
  links: { label: string; href: string }[]
}

// PLACEHOLDER — four invented projects so the layout is real. Replace all of them.
export const PROJECTS: Project[] = [
  {
    id: 'pipeline',
    title: 'Event pipeline rewrite',
    year: '2025',
    status: 'Shipped',
    scope: 5,
    blurb:
      'Replaced a cron-and-hope batch job with a streaming pipeline that survives its own retries.',
    detail: [
      'The old system processed events in nightly batches. When a batch failed halfway, the recovery story was a human reading logs at 3am — so the real cost was never compute, it was attention.',
      'I moved it to an append-only log with idempotent consumers keyed on event id, which made retries free and let us replay any window on demand. The interesting problem was not throughput but ordering: two events for the same entity arriving out of order had to converge on the same final state regardless of delivery sequence.',
      'It shipped behind a shadow-write flag for six weeks, comparing old and new output row by row before anyone trusted it.',
    ],
    stack: ['TypeScript', 'Kafka', 'Postgres', 'AWS ECS', 'Terraform'],
    metrics: [
      { label: 'Latency', value: '8h → 40s' },
      { label: 'On-call pages', value: '−90%' },
      { label: 'Events / day', value: '12M' },
    ],
    links: [
      { label: 'Write-up', href: '#' },
      { label: 'Source', href: '#' },
    ],
  },
  {
    id: 'devenv',
    title: 'Local dev environment CLI',
    year: '2024',
    status: 'Live',
    scope: 3,
    blurb:
      'One command to get a fourteen-service stack running, because onboarding should not take a week.',
    detail: [
      'New engineers were losing their first three days to environment setup. I wrote a CLI that provisions the whole stack from a declarative manifest, with health checks that explain what is broken in plain English instead of dumping a container log.',
      'The part I am proudest of is the error messages. Every failure path names the thing that went wrong and the exact command that fixes it.',
    ],
    stack: ['Rust', 'Docker', 'gRPC'],
    metrics: [
      { label: 'Onboarding', value: '3d → 20m' },
      { label: 'Weekly users', value: '60+' },
    ],
    links: [{ label: 'Source', href: '#' }],
  },
  {
    id: 'particles',
    title: 'GPU particle sandbox',
    year: '2025',
    status: 'Growing',
    scope: 4,
    blurb: 'A million-particle simulation running entirely on the GPU, with no CPU in the hot loop.',
    detail: [
      'A side project to properly learn compute shaders. Particle position and velocity live in ping-pong textures, so the CPU only uploads uniforms and the whole simulation stays resident on the GPU.',
      'The meadow behind this page is a much smaller cousin of it — same idea, fewer particles, and it has to share a frame budget with actual content.',
    ],
    stack: ['WebGPU', 'WGSL', 'TypeScript'],
    metrics: [
      { label: 'Particles', value: '1.0M' },
      { label: 'Frame time', value: '4.2ms' },
    ],
    links: [
      { label: 'Demo', href: '#' },
      { label: 'Source', href: '#' },
    ],
  },
  {
    id: 'netcode',
    title: 'Multiplayer netcode experiment',
    year: '2023',
    status: 'Dormant',
    scope: 4,
    blurb:
      'Client-side prediction and rollback for a browser game, built to understand why it is hard.',
    detail: [
      'I wanted to know why multiplayer games feel bad on a poor connection, so I built one. Authoritative server at 30Hz, clients predicting locally and rolling back when the server disagrees.',
      'Dormant because it answered its question. The lesson that stuck: the hard part of netcode is not bandwidth, it is deciding whose version of reality wins — and hiding the moment you change your mind.',
    ],
    stack: ['TypeScript', 'WebSockets', 'Canvas'],
    metrics: [
      { label: 'Tick rate', value: '30Hz' },
      { label: 'Playable to', value: '180ms RTT' },
    ],
    links: [{ label: 'Source', href: '#' }],
  },
]

export type Season = {
  period: string
  org: string
  role: string
  note: string
}

// PLACEHOLDER — your actual history.
export const HISTORY: Season[] = [
  {
    period: '2024 — now',
    org: 'Amazon',
    role: 'Software Engineer',
    note: 'Backend services and internal tooling. Owned the event pipeline rewrite end to end.',
  },
  {
    period: '2022 — 2024',
    org: 'Startup, ~20 people',
    role: 'Full-stack Engineer',
    note: 'Shipped the product surface and the infrastructure under it, often in the same week.',
  },
  {
    period: '2019 — 2022',
    org: 'University',
    role: 'BSc Computer Science',
    note: 'The graphics and distributed systems modules did the most damage, in a good way.',
  },
]

// PLACEHOLDER — real links. Entries left as `href: '#'` render dimmed and inert.
export const LINKS = [
  { label: 'Email', value: 'you@example.com', href: 'mailto:you@example.com' },
  { label: 'GitHub', value: 'github.com/minaabdi', href: 'https://github.com/minaabdi' },
  { label: 'LinkedIn', value: 'linkedin.com/in/minaabdi', href: 'https://linkedin.com/in/minaabdi' },
  { label: 'Résumé', value: 'download PDF', href: '#' },
]

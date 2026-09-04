/**
 * ─────────────────────────────────────────────────────────────────────────────
 * EDIT THIS FILE. It is the only file you need to touch to make the site yours.
 * Everything marked PLACEHOLDER is invented copy — swap it for the real thing.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type Section = {
  id: string
  index: string
  label: string
}

export const SECTIONS: Section[] = [
  { id: 'start', index: '00', label: 'START' },
  { id: 'loadout', index: '01', label: 'LOADOUT' },
  { id: 'missions', index: '02', label: 'MISSIONS' },
  { id: 'profile', index: '03', label: 'PROFILE' },
  { id: 'uplink', index: '04', label: 'UPLINK' },
]

export const PLAYER = {
  // PLACEHOLDER — your name, exactly as you want it rendered huge.
  name: 'MINA ABDI',
  handle: 'minaabdi',
  role: 'SOFTWARE ENGINEER',
  // PLACEHOLDER — one line, no fluff. This sits under your name.
  tagline: 'I build systems that hold up under load and interfaces that feel alive.',
  location: 'LONDON, UK',
  status: 'OPEN TO WORK',
  // PLACEHOLDER — 2–3 sentences. Written like a person, not a CV.
  bio: [
    'I am a software engineer who likes the unglamorous half of the job: the failure modes, the p99, the migration nobody wants to own. I got here through games — spending my teens reverse-engineering mods taught me to read systems before trusting them.',
    'These days I work mostly on backend and developer tooling, and I keep a graphics side-project running at all times so the fun never fully leaves the work.',
  ],
}

/** Skills, rendered as XP bars. `level` is 0–100 and is yours to be honest about. */
export type Stat = {
  label: string
  level: number
  detail: string
}

export type StatGroup = {
  title: string
  stats: Stat[]
}

// PLACEHOLDER — replace with what you actually use.
export const STAT_GROUPS: StatGroup[] = [
  {
    title: 'CORE',
    stats: [
      { label: 'TypeScript', level: 92, detail: 'Daily driver. Strict mode, no exceptions.' },
      { label: 'Python', level: 84, detail: 'Services, tooling, data plumbing.' },
      { label: 'Java', level: 76, detail: 'Large backend codebases, Spring.' },
      { label: 'Rust', level: 48, detail: 'Learning in public. CLI tools, WASM.' },
    ],
  },
  {
    title: 'SYSTEMS',
    stats: [
      { label: 'AWS', level: 88, detail: 'Lambda, DynamoDB, ECS, IAM the hard way.' },
      { label: 'Distributed design', level: 80, detail: 'Queues, idempotency, backpressure.' },
      { label: 'Postgres', level: 78, detail: 'Query plans, indexes, migrations.' },
      { label: 'Observability', level: 74, detail: 'Traces and dashboards that answer questions.' },
    ],
  },
  {
    title: 'RENDER',
    stats: [
      { label: 'React', level: 90, detail: 'Including the parts that re-render too much.' },
      { label: 'WebGL / GLSL', level: 70, detail: 'Shaders, particle systems, this page.' },
      { label: 'Interaction design', level: 68, detail: 'Motion with a reason to exist.' },
    ],
  },
]

export type Project = {
  id: string
  codename: string
  title: string
  year: string
  status: 'SHIPPED' | 'LIVE' | 'IN PROGRESS' | 'ARCHIVED'
  difficulty: 1 | 2 | 3 | 4 | 5
  blurb: string
  /** Shown when the mission briefing opens. One paragraph per entry. */
  detail: string[]
  stack: string[]
  metrics: { label: string; value: string }[]
  links: { label: string; href: string }[]
}

// PLACEHOLDER — four invented projects so the layout is real. Replace all of them.
export const PROJECTS: Project[] = [
  {
    id: 'atlas',
    codename: 'ATLAS',
    title: 'Event pipeline rewrite',
    year: '2025',
    status: 'SHIPPED',
    difficulty: 5,
    blurb:
      'Replaced a cron-and-hope batch job with a streaming pipeline that survives its own retries.',
    detail: [
      'The old system processed events in nightly batches. When a batch failed halfway, the recovery story was a human reading logs at 3am, so the real cost was not compute — it was attention.',
      'I moved it to an append-only log with idempotent consumers keyed on event id, which made retries free and let us replay any window on demand. The interesting problem was not throughput but ordering: two events for the same entity arriving out of order had to converge to the same final state regardless of delivery sequence.',
      'The rewrite shipped behind a shadow-write flag for six weeks, comparing old and new output row by row before anyone trusted it.',
    ],
    stack: ['TypeScript', 'Kafka', 'Postgres', 'AWS ECS', 'Terraform'],
    metrics: [
      { label: 'LATENCY', value: '8h → 40s' },
      { label: 'ON-CALL PAGES', value: '−90%' },
      { label: 'EVENTS / DAY', value: '12M' },
    ],
    links: [
      { label: 'WRITE-UP', href: '#' },
      { label: 'SOURCE', href: '#' },
    ],
  },
  {
    id: 'forge',
    codename: 'FORGE',
    title: 'Local dev environment CLI',
    year: '2024',
    status: 'LIVE',
    difficulty: 3,
    blurb:
      'One command to get a 14-service stack running, because onboarding should not take a week.',
    detail: [
      'New engineers were losing their first three days to environment setup. I wrote a CLI that provisions the whole stack from a declarative manifest, with health checks that explain what is broken in plain English instead of dumping a container log.',
      'The part I am proudest of is the error messages. Every failure path names the thing that went wrong and the exact command that fixes it.',
    ],
    stack: ['Rust', 'Docker', 'gRPC'],
    metrics: [
      { label: 'ONBOARDING', value: '3d → 20m' },
      { label: 'WEEKLY USERS', value: '60+' },
    ],
    links: [{ label: 'SOURCE', href: '#' }],
  },
  {
    id: 'prism',
    codename: 'PRISM',
    title: 'GPU particle sandbox',
    year: '2025',
    status: 'IN PROGRESS',
    difficulty: 4,
    blurb:
      'A million-particle simulation running entirely on the GPU, with no CPU in the hot loop.',
    detail: [
      'A side project to properly learn compute shaders. Particle position and velocity live in ping-pong textures, so the CPU only uploads uniforms and the whole simulation stays resident on the GPU.',
      'The field behind this page is a much smaller cousin of it — same idea, fewer particles, and it has to share a frame budget with actual content.',
    ],
    stack: ['WebGPU', 'WGSL', 'TypeScript'],
    metrics: [
      { label: 'PARTICLES', value: '1.0M' },
      { label: 'FRAME TIME', value: '4.2ms' },
    ],
    links: [
      { label: 'DEMO', href: '#' },
      { label: 'SOURCE', href: '#' },
    ],
  },
  {
    id: 'relay',
    codename: 'RELAY',
    title: 'Multiplayer netcode experiment',
    year: '2023',
    status: 'ARCHIVED',
    difficulty: 4,
    blurb:
      'Client-side prediction and rollback for a browser game, built to understand why it is hard.',
    detail: [
      'I wanted to know why multiplayer games feel bad on a poor connection, so I built one. Authoritative server at 30Hz, clients predicting locally and rolling back when the server disagrees.',
      'Archived because it answered its question. The lesson that stuck: the hard part of netcode is not bandwidth, it is deciding whose version of reality wins and hiding the moment you change your mind.',
    ],
    stack: ['TypeScript', 'WebSockets', 'Canvas'],
    metrics: [
      { label: 'TICK RATE', value: '30Hz' },
      { label: 'PLAYABLE TO', value: '180ms RTT' },
    ],
    links: [{ label: 'SOURCE', href: '#' }],
  },
]

export type Run = {
  period: string
  org: string
  role: string
  note: string
}

// PLACEHOLDER — your actual history.
export const RUNS: Run[] = [
  {
    period: '2024 — NOW',
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
    note: 'Graphics and distributed systems modules did the most damage, in a good way.',
  },
]

// PLACEHOLDER — real links. Empty `href: '#'` entries render as disabled.
export const LINKS = [
  { label: 'EMAIL', value: 'you@example.com', href: 'mailto:you@example.com' },
  { label: 'GITHUB', value: 'github.com/minaabdi', href: 'https://github.com/minaabdi' },
  { label: 'LINKEDIN', value: 'linkedin.com/in/minaabdi', href: 'https://linkedin.com/in/minaabdi' },
  { label: 'RESUME', value: 'download PDF', href: '#' },
]

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * EDIT THIS FILE. It is the only file you need to touch to make the site yours.
 * Anything still marked PLACEHOLDER is a guess — check it before you publish.
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
    lede: 'What I reach for, and roughly how far along each one is.',
    scheme: 'dusk',
  },
  {
    id: 'blooms',
    title: 'Blooms',
    plain: 'Projects',
    lede: 'Four things I built. Open any one for the whole story.',
    scheme: 'dawn',
  },
  {
    id: 'roots',
    title: 'Roots',
    plain: 'About',
    lede: 'Where this came from.',
    scheme: 'light',
  },
  {
    id: 'reach',
    title: 'Reach',
    plain: 'Contact',
    lede: 'Open to early-career software roles. The inbox is quiet and I answer it.',
    scheme: 'light',
  },
]

export const ME = {
  name: 'Mumina Abdi',
  role: 'Software Engineer',
  tagline: 'Games got me into code. Backend services are what keep me here.',
  // PLACEHOLDER — the résumé lists a Michigan number and Michigan State, but
  // the AWS role is in Seattle. Set this to wherever you want to be reached.
  location: 'Grand Rapids, MI',
  status: 'Open to work',
  bio: [
    'I am a software engineer who came in through games. I studied Games and Interactive Media at Michigan State, which is where I learned that the interesting part of a system is usually the part the player never sees — and I have been chasing that part ever since.',
    'Most recently I was the sole developer on a V2 rewrite of a Java metadata service at AWS, which I owned from the API contract down to the infrastructure. I like the work where correctness matters: ownership checks, cache invalidation, per-item error reporting, the tests that catch the case nobody thought of.',
    'This page is the other half of it. A live meadow in WebGL, in the spirit of thatgamecompany’s Flower — the field opens at dusk and comes into colour as you scroll, and the flowers only open where you actually pass through them.',
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

// PLACEHOLDER — the skills themselves come from your résumé, but every `level`
// number is my estimate. Nudge them until they read true to you.
export const SKILL_GROUPS: SkillGroup[] = [
  {
    title: 'Languages',
    skills: [
      { label: 'Python', level: 88, detail: 'OOP backends, Flask APIs, test-first.' },
      { label: 'Java', level: 82, detail: 'Production service work. 32-hour cert, 33/33.' },
      { label: 'JavaScript / TypeScript', level: 80, detail: 'React and Next.js front to back.' },
      { label: 'SQL', level: 74, detail: 'Relational modelling, MySQL, Prisma, SQLAlchemy.' },
    ],
  },
  {
    title: 'Cloud & infrastructure',
    skills: [
      { label: 'AWS CDK', level: 78, detail: 'Shipped production IaC: tables, alarms, scoped IAM.' },
      { label: 'DynamoDB', level: 76, detail: 'Cache-first read paths and their invalidation.' },
      { label: 'Lambda & API Gateway', level: 74, detail: 'Service endpoints, batch APIs, STS.' },
      { label: 'CloudWatch', level: 70, detail: 'Dashboards and alarms that answer questions.' },
    ],
  },
  {
    title: 'Craft',
    skills: [
      { label: 'Testing & TDD', level: 84, detail: 'JUnit, Mockito, pytest. Tests before code.' },
      { label: 'Code review', level: 80, detail: '~9 peer-reviewed CRs across 4 production packages.' },
      { label: 'React & UI', level: 78, detail: 'Tailwind, Material UI, Figma. Motion with a reason.' },
      { label: 'Pair programming', level: 76, detail: 'Driver / navigator, alternating, out loud.' },
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

export const PROJECTS: Project[] = [
  {
    id: 'metadata-v2',
    title: 'Security findings metadata service, V2',
    year: '2026',
    status: 'Shipped',
    scope: 5,
    blurb:
      'Sole developer on the rewrite of a Java service that enriches S3 security findings — API contract, infrastructure, logic and tests.',
    detail: [
      'I owned this end to end at AWS: the API contract, the infrastructure, the service logic and the test suite. All five project milestones shipped to production, each with an implementation design written before the code.',
      'Two changes did most of the work on latency. The resource-ownership check was O(n) in the number of resources, and became O(1); and the backend metadata calls, which had been sequential, were parallelised. Large-account requests were where that showed up, because they are the ones with enough resources for the difference to be visible.',
      'The read path is cache-first with per-request ownership verification, so a cache hit never leaks across account boundaries. The batch endpoint reports errors per item rather than failing the whole call — one bad identifier in a list of two hundred should not cost the caller the other hundred and ninety-nine.',
      'The infrastructure shipped as AWS CDK: the DynamoDB cache table, the monitoring, and IAM scoped to exactly what the service needs. I used Claude Code throughout for development, testing and documentation, and presented the work org-wide at the end.',
    ],
    stack: ['Java', 'AWS CDK', 'DynamoDB', 'API Gateway', 'IAM', 'CloudWatch', 'JUnit', 'Mockito'],
    metrics: [
      { label: 'Milestones shipped', value: '5 / 5' },
      { label: 'Ownership check', value: 'O(n) → O(1)' },
      { label: 'Commits / packages', value: '~48 / 4' },
    ],
    // No public source — internal AWS work.
    links: [],
  },
  {
    id: 'task-api',
    title: 'Task List API',
    year: '2025',
    status: 'Shipped',
    scope: 3,
    blurb:
      'A RESTful Flask API with full CRUD, sortable and filterable queries, and a Slack notification whenever a task is completed.',
    detail: [
      'Built as a full pass over the shape of a real HTTP service: CRUD across every resource, query parameters for sorting and filtering, and custom endpoints for the operations that do not fit the CRUD verbs.',
      'The relational side uses SQLAlchemy with a one-to-many relationship from Goals to Tasks, which is where most of the interesting query work lived. Completing a task calls out to the Slack API, so the integration had to hold up when the external service is slow or unavailable rather than taking the request down with it.',
      'Tested against a provided suite with TDD, driven manually through Postman, secrets kept in environment variables, and deployed to a cloud platform so it runs somewhere other than my machine.',
    ],
    stack: ['Python', 'Flask', 'SQLAlchemy', 'Slack API', 'Postman'],
    metrics: [
      { label: 'Style', value: 'REST + TDD' },
      { label: 'Data model', value: 'Goals → Tasks' },
    ],
    // PLACEHOLDER — add the GitHub URL and I will make this live.
    links: [{ label: 'Source', href: '#' }],
  },
  {
    id: 'swap-meet',
    title: 'Swap Meet Backend',
    year: '2025',
    status: 'Shipped',
    scope: 3,
    blurb:
      'A multi-class object-oriented backend letting vendors manage inventories and trade items by category, quality, or unique ID.',
    detail: [
      'Vendor, Item, and then Clothing, Decor and Electronics inheriting from it — with unique ID generation, an overridden string representation per type, and the condition-rating logic shared on the base class rather than copied three times.',
      'The trading surface is three methods that get progressively less obliging: swap two named items, swap whatever each vendor happens to have first, and find the best available item in a given category. That last one is where the shared quality logic earns its place.',
      'Written test-first, and paired throughout with alternating driver and navigator roles — which is a real part of why it is structured the way it is.',
    ],
    stack: ['Python', 'OOP', 'pytest'],
    metrics: [
      { label: 'Approach', value: 'TDD, paired' },
      { label: 'Item types', value: 'Inheritance ×3' },
    ],
    // PLACEHOLDER — add the GitHub URL and I will make this live.
    links: [{ label: 'Source', href: '#' }],
  },
  {
    id: 'wevise',
    title: 'Wevise platform',
    year: '2024 — 2025',
    status: 'Live',
    scope: 3,
    blurb:
      'Full-stack feature work and QA on a live platform, as a volunteer engineer on a remote team.',
    detail: [
      'React and Next.js on the front, Node and MySQL through Prisma behind it, Tailwind for the surface, Docker to make all of that run the same way on everybody’s machine.',
      'A good share of the work was QA rather than features: finding the defect, writing the Jira issue so that somebody else could reproduce it, and then fixing it. That effort tracked to roughly a 15% improvement in platform stability.',
      'Remote sprints across time zones. I took the role because Wevise is trying to widen who gets into tech and who gets mentored once they are there, which is the same reason Ada mattered to me.',
    ],
    stack: ['React', 'Next.js', 'Tailwind', 'Node.js', 'Prisma', 'MySQL', 'Docker', 'Jira'],
    metrics: [
      { label: 'Platform stability', value: '+15%' },
      { label: 'Team', value: 'Remote, sprints' },
    ],
    links: [{ label: 'Wevise', href: '#' }],
  },
]

export type Season = {
  period: string
  org: string
  role: string
  note: string
}

export const HISTORY: Season[] = [
  {
    period: 'Mar 2026 — Sep 2026',
    org: 'Amazon Web Services',
    role: 'Software Development Engineer Apprentice',
    note: 'Sole developer on the V2 rewrite of a Java metadata service for S3 security findings. Shipped all five milestones, plus the CDK infrastructure under them. Presented org-wide.',
  },
  {
    period: 'Sep 2025 — Jul 2026',
    org: 'Ada Developer Academy',
    role: 'Software Engineering Student',
    note: 'A 17%-acceptance program for people underrepresented in tech. Python, JavaScript, React, SQL, TDD and pair programming, all of it in team sprints with real code review.',
  },
  {
    period: 'Nov 2024 — Sep 2025',
    org: 'Wevise',
    role: 'Junior Software Engineer, volunteer',
    note: 'Full-stack feature work and QA on a live platform. Remote sprints, Jira, and a measurable dent in the bug count.',
  },
  {
    // PLACEHOLDER — your résumé gives no years for the degree. Swap 'Education'
    // for the range (e.g. '2020 — 2024') if you want it on the timeline.
    period: 'Education',
    org: 'Michigan State University',
    role: 'BA, Games and Interactive Media',
    note: 'East Lansing, MI. Where the interest in systems started — and where I learned that shipping something people can actually play is a different skill from making it work.',
  },
]

// Entries left as `href: '#'` render dimmed and inert on purpose.
export const LINKS = [
  { label: 'Email', value: 'muminaabdi13@gmail.com', href: 'mailto:muminaabdi13@gmail.com' },
  // PLACEHOLDER — your résumé has no GitHub URL, so this stays inert rather
  // than guessing a handle. Fill in both fields when you want it live.
  { label: 'GitHub', value: 'coming soon', href: '#' },
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/mumina-abdi',
    href: 'https://linkedin.com/in/mumina-abdi/',
  },
  // PLACEHOLDER — drop the PDF into `public/` and point this at `/resume.pdf`.
  { label: 'Résumé', value: 'download PDF', href: '#' },
]

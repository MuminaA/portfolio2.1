# Portfolio

A software-engineer portfolio built as a game interface: a generative WebGL
particle field that reacts to your cursor and scroll position, wrapped in HUD
chrome, mission briefings and achievement toasts.

Stack: Vite + React 19 + TypeScript, three.js via `@react-three/fiber`, custom
GLSL, Framer Motion for the DOM animation.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # → dist/
npm run preview    # serve the production build locally
```

---

## Make it yours

**Almost everything you need to change lives in one file: `src/data/content.ts`.**

Every field currently holding invented copy is marked `PLACEHOLDER`. Work
through them in this order:

| What | Where in `content.ts` |
| --- | --- |
| Your name, role, tagline, bio, status | `PLAYER` |
| Skills and the XP-bar levels | `STAT_GROUPS` |
| Projects, briefings, metrics, links | `PROJECTS` |
| Work / education history | `RUNS` |
| Email, GitHub, LinkedIn, resume | `LINKS` |

Two more things worth changing:

- **`index.html`** — the `<title>`, `description` and Open Graph tags. These are
  what show up in a Google result and in a Slack/LinkedIn link preview.
- **`src/index.css`** — the colours are the three CSS variables `--cy`, `--mg`
  and `--lm` at the top. The field reads matching values from
  `src/components/Field.tsx` (`uColorA`, `uColorB`, `uColorC`) — change both so
  the WebGL layer and the UI stay in agreement.

Links set to `href: '#'` render dimmed and non-clickable on purpose, so an
unfinished link never looks broken.

---

## Deploying to Vercel (free)

`vercel.json` is already configured. Pick either route.

### Route A — connect a GitHub repo (recommended, auto-deploys on push)

```bash
git init
git add -A
git commit -m "Portfolio"
gh repo create portfolio --public --source=. --push   # or create it on github.com
```

Then at [vercel.com/new](https://vercel.com/new): sign in with GitHub, import the
repo, and accept the defaults — Vercel detects Vite, runs `npm run build` and
serves `dist/`. Every later `git push` redeploys automatically.

### Route B — deploy straight from this folder

```bash
npm i -g vercel
vercel          # first run: answer the prompts, creates a preview URL
vercel --prod   # promote to your live URL
```

You get `your-project.vercel.app` free, with HTTPS. A custom domain can be
added later under **Project → Settings → Domains** (the domain itself costs
money; Vercel's hosting of it does not).

---

## Notes on how it works

**The field** (`src/components/Field.tsx`) is two layers welded to the same
displaced surface: a ~27k-point cloud and a coarse wireframe. Both run the same
`fieldPoint()` GLSL function — three octaves of simplex noise, plus a travelling
wave driven by scroll position, plus a well that follows your cursor and an
expanding annulus on click. Additive blending, no lighting, no post-processing.

**Input never touches React.** Pointer position, scroll progress and click
timestamps live in a plain mutable object (`src/lib/tracker.ts`) that the render
loop and the HUD read directly, so nothing re-renders at 60fps.

**Performance.** three.js is lazy-loaded, so first paint costs ~112kB gzipped
and the renderer downloads while the boot sequence plays. Particle count and
point size drop automatically on narrow screens or CPUs reporting ≤4 cores.
Device pixel ratio is capped at 1.75.

**Accessibility.** `prefers-reduced-motion` slows the field to a near-standstill
and disables the glitch and transition animations. The canvas is
`aria-hidden` — it is decoration, and every piece of real content is ordinary
focusable DOM. Sections are reachable by keyboard with the number keys `0`–`4`.

**Easter egg.** ↑↑↓↓←→←→BA shifts the field palette.

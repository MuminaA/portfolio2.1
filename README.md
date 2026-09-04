# Portfolio

A software-engineer portfolio built as a meadow, in the spirit of *Flower*
(thatgamecompany, 2009): a live WebGL field of grass with wind you can steer,
a drifting trail of petals, and almost no interface. The world opens
desaturated at dusk and warms into full colour as you scroll.

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

It is filled in from the résumé. What is left is marked `PLACEHOLDER`:

- the `level` number on every skill — the skills are real, the numbers are an estimate
- the GitHub link, and the `Source` links on the two Python projects
- the résumé PDF (drop it in `public/` and point the link at `/resume.pdf`)
- `location`, and the years for the degree

The fields themselves: 

| What | Where in `content.ts` |
| --- | --- |
| Your name, role, tagline, bio, status | `ME` |
| Skills and the level each stem grows to | `SKILL_GROUPS` |
| Projects, write-ups, metrics, links | `PROJECTS` |
| Work / education history | `HISTORY` |
| Email, GitHub, LinkedIn, resume | `LINKS` |

The five section names, ledes and their text schemes are also in there, as
`SECTIONS`.

Two more things worth changing:

- **`index.html`** — the `<title>`, `description` and Open Graph tags. These are
  what show up in a Google result and in a Slack/LinkedIn link preview.
- **`src/lib/palette.ts`** — the whole dusk→bloom arc, as three stops. The CSS
  and the shaders both read this one table, so editing a hex here changes the
  sky, the grass and the petals together. Nothing to keep in sync by hand.

Links set to `href: '#'` render dimmed and non-clickable on purpose, so an
unfinished link never looks broken.

---

## Deploying to Vercel (free)

`vercel.json` is already configured. Pick either route.

### Route A — connect a GitHub repo (recommended, auto-deploys on push)

```bash
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

**The meadow** (`src/components/Field.tsx`) is three layers, all sharing one
`groundAt()` height function so they agree on where the earth is: a displaced
ground mesh, ~26k blades of grass as `LineSegments`, and the petals as points.
Wind is multi-octave simplex noise advected along a slowly swinging direction
(`src/lib/glsl.ts`); your cursor adds a local gust and a click sends a ring
rolling outward. There is no lighting and no post-processing.

Depth testing is off throughout — thin alpha lines and a depth buffer do not
mix — so **draw order is the sort order**. The blades are sorted far-to-near at
build time, and the layers carry explicit `renderOrder` values.

The materials are constructed by hand rather than declared as
`<shaderMaterial uniforms={...} />`, and that is deliberate: R3F does not adopt
a `uniforms` prop, it copies each entry into the material's own uniform objects.
Object values survive that (a `Color` is copied by reference, so mutating it in
place still reaches the shader) but **numbers are copied by value and then
frozen for the life of the material** — which silently stops the clock, the wind
and every scalar the frame loop writes. Building the material directly makes
`material.uniforms` the very object being written to.

**The flowers** are buds until something comes near, then they snap open with a
flash and wilt shut once you leave. Two details matter: the open and close radii
differ, or a flower sitting exactly on the threshold flickers as the pointer
jitters; and their heads deliberately sit *below* the camera's eye, because
anything at eye height projects onto one horizontal line regardless of distance
and pins the whole meadow to the horizon.

**One steered point** drives the trail head, the wind gust and the flowers
together. Its distance from the camera comes from how high the pointer sits on
screen, not from intersecting the ground plane — with the camera at eye height
tilted upward, that intersection is either two units away or past the horizon,
with nothing usable in between. That distance is eased and kept to a narrow
band, since an unsmoothed reach turns a small flick into a lurch tens of units
down the view axis. Its height is floored but not capped — a ceiling means the
petals cannot climb into the sky, so they can never follow the cursor over the
top half of the screen. The floor is load-bearing: with depth testing off, a
head that sinks under the earth still draws on top of it.

**The petal trail** is a CPU ring buffer of recent head positions. Petals are
spaced along the *distance the head has travelled*, not along frame count — the
loop walks back through the buffer accumulating arc length. Spacing by frames
makes the ribbon's length depend on how fast the cursor happened to be moving,
so a quick sweep strings the petals out into a single-file thread with gaps
between them. Each petal also gets a private noise orbit to give the ribbon
volume, scaled with distance so it does not collapse onto a wire.

**One palette, two consumers.** `src/lib/palette.ts` holds three colour stops.
`applyWorldVars()` lerps them in sRGB and writes CSS custom properties;
`buildStopColors()` pre-parses the same stops into `THREE.Color` and lerps them
in linear space each frame. The horizon has no visible seam because the shader
fades the grass into exactly the `--haze` the CSS sky is painting.

**Input never touches React.** Pointer position, scroll progress, pointer speed
and the bloom value live in a plain mutable object (`src/lib/tracker.ts`) that
the render loop reads directly, so nothing re-renders at 60fps.

**Text contrast.** The world blooms continuously, but text colour steps per
section via `data-scheme` (dusk / dawn / light) — a continuous ink crossfade
would pass through mid-grey and be unreadable against a mid-tone sky. Anything
sitting low in the frame, where the grass is thickest, gets a frosted veil
rather than only a text halo.

**Performance.** three.js is lazy-loaded, so first paint costs ~110kB gzipped
and the renderer downloads while the first screen of type is already up. Blade
and petal counts drop automatically on narrow screens or CPUs reporting ≤4
cores. Device pixel ratio is capped at 1.75.

**Accessibility.** `prefers-reduced-motion` slows the wind to a near-standstill
and stills the camera. The canvas is `aria-hidden` — it is decoration, and
every piece of real content is ordinary focusable DOM. The nav dots are real
buttons with labels that are always available to a screen reader, revealed
visually on hover or focus.

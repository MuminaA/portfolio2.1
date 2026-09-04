# Rebuild prompt

Paste everything below the line as the first message in a fresh session, with the
résumé dropped in where marked.

---

Build me a software-engineer portfolio as a live WebGL meadow, in the spirit of
*Flower* (thatgamecompany, 2009). Free to host on Vercel. Work through it in one
pass — the spec below is already decided, so don't ask me to choose things.

## Stack (exact)

Vite 6 + React 19 + TypeScript 5.7. `@react-three/fiber` 9 + `three` 0.174 —
**no drei**, custom GLSL only. `framer-motion` for DOM animation. tsconfig
strict, plus `verbatimModuleSyntax` (use `import type`), `erasableSyntaxOnly`,
`noUnusedLocals`, `noUnusedParameters`. Ship a `vercel.json`.

## Shape

Five full-height sections, almost no chrome: Drift (hero) · Growth (skills as
growing stems) · Blooms (projects as cards that open) · Roots (timeline) · Reach
(contact). Nav is five petal-shaped dots, real buttons with always-available
labels revealed on hover/focus. The canvas is `aria-hidden` decoration; all real
content is ordinary focusable DOM.

Files: `src/lib/{glsl,palette,tracker,scroll}.ts`,
`src/hooks/{useWorldPalette,useActiveSection}.ts`,
`src/components/{Field,Sky,Nav,Section,Drift,Growth,Blooms,Roots,Reach}.tsx`,
`src/data/content.ts`. Lazy-load `Field.tsx` so first paint doesn't wait on three.

## The world

Three layers sharing one `groundAt()` height function: a displaced ground mesh,
~26k blades as `LineSegments`, petals as `Points`. Plus flower heads + stalks,
and fireflies. Wind is 3-octave Ashima simplex noise advected along a slowly
swinging direction. Cursor adds a local gust well; click sends a ring rolling
outward. No lighting, no post-processing.

Constants: `NEAR_Z = 7`, `FAR_Z = -95`, `FOG_NEAR = 30`, `FOG_FAR = 106`,
camera `fov: 58` at `[0, 1.1, NEAR_Z - 0.2]` looking at `y ≈ 3.5` so the lens
tilts up and the horizon sits at ~58% of frame.

## Palette — one table, two consumers

`src/lib/palette.ts` holds three stops at 0 / 0.55 / 1. `applyWorldVars()` lerps
them in sRGB into CSS custom properties (and sets `--bloom`); `buildStopColors()`
pre-parses the same stops into `THREE.Color` and lerps in linear space each
frame. Three stops not two, because a straight dusk→bloom line passes through
muddy olive; the dawn stop routes it through warm rose.

Keys: skyTop, skyMid, skyLow, sun, haze, grassBase, grassTip, petal, petalLight.

- 0.00 dormant: `#1e2530 #333c4a #5a6474 #7d8996 #4c5665 #2b3634 #57655c #95a0ac #ccd4dd`
- 0.55 dawn:    `#4a5472 #8d7e93 #dda27c #ffb877 #b3907f #4a5a45 #8ba455 #f2a8ae #ffdac9`
- 1.00 bloom:   `#8fc6e8 #c3e2ef #ffd9a8 #ffcf5c #ffe3b8 #4f8033 #b9db5e #ff9fb8 #ffe2ec`

## Behaviours

- **Petal trail** follows the cursor: a CPU ring buffer (`HIST = 180`) of head
  positions, petals spaced along *arc length travelled*, not frame count. Each
  petal gets a private noise orbit for volume.
- **Flowers** are buds that snap open with a flash where the trail passes and
  wilt shut once you leave.
- **Petal colour** fans into five quantised hue buckets as the sunrise advances
  (`petalTint()` in glsl.ts) — blue-violet, violet, pink, orange, gold. Five
  chosen hues rather than a continuous rainbow, which puts most petals in the
  muddy in-betweens; stop short of green and true blue, which vanish into the
  grass and the sky.
- **Fireflies** drift over the dark field and are gone before daylight, on a
  window that overlaps the first of the petal tint so the two changes read as one
  sunrise. All their motion is in the vertex shader.
- **Text colour steps** per section via `data-scheme` (dusk / dawn / light), not
  continuously — a continuous ink crossfade passes through mid-grey and is
  unreadable against a mid-tone sky.

## Get these right the first time — they each cost me an iteration

1. **R3F does not adopt a `uniforms` prop.** It copies each entry into the
   material's own uniform objects. Object values survive by reference; **numbers
   are copied by value and then frozen for the life of the material** — which
   silently kills uTime, the gust amplitudes and every scalar the frame loop
   writes, so the world renders as a still image. So: construct each
   `THREE.ShaderMaterial` by hand in a `useMemo` and pass it as
   `material={...}`. Never `<shaderMaterial uniforms={...} />`.
2. **Depth testing is off throughout** (thin alpha lines + a depth buffer don't
   mix), so draw order IS sort order. Sort blades far-to-near at build time and
   set explicit `renderOrder`: ground 0, grass 1, stalks 2, flower heads 3,
   fireflies 4, petals 5.
3. **Prefix all noise helpers** (`fw_mod289`, `fw_noise`, …) or they collide with
   three's ShaderChunks. End every fragment shader with
   `#include <colorspace_fragment>` — raw `ShaderMaterial` otherwise outputs
   wrong-gamma colour.
4. **Colours reach the shader in linear-sRGB** (`new THREE.Color(hex)` converts).
   A saturation of 0.6 in-shader still encodes to a pastel, so any tint has to
   push saturation hard — and *add* it rather than scale it, since the dusk petal
   stop is near-grey on purpose.
5. **The trail head's distance comes from pointer height on screen, not from
   intersecting the ground plane.** With the camera 1.1 units up and tilted up,
   that intersection is either 2 units away or past the horizon with nothing
   usable between — the flowers are never in reach of it. Ease the reach and keep
   it to a narrow band (~1.5 to 23) or a small flick lurches the trail tens of
   units down the view axis.
6. **Floor the head's height, never cap it.** A ceiling means the petals can't
   climb into the sky, so they can never follow the cursor over the top half of
   the screen. The floor is load-bearing: with depth testing off, a head that
   sinks under the earth still draws on top of it.
7. **Flower open and close radii must differ**, or a flower sitting on the
   threshold flickers as the pointer jitters. Test proximity in 3D, not just in
   XZ — otherwise flowers open when you pass *above* them.
8. **Flower heads sit below the camera's eye line.** Anything at eye height
   projects onto one horizontal line regardless of distance and pins the whole
   meadow to the horizon.
9. **Fireflies fade with proximity as well as being size-capped**, and an unlit
   one shrinks as well as dims — a capped disc is still a disc, and a wide dim
   disc is a soap bubble rather than an insect.
10. **Input never touches React.** Pointer position, speed, scroll and bloom live
    in a module-level mutable object read directly by the render loop.
11. Ease with `ease = (rate) => 1 - Math.pow(rate, dt)` — smaller rate converges
    faster. Clamp `dt` to 1/20.

## Performance & a11y

Tier blade/petal/flower/firefly counts by `innerWidth` and `hardwareConcurrency`
(≤4 cores → low). Cap DPR at 1.75. `prefers-reduced-motion` slows the wind to a
near-standstill and stills the camera. Anything sitting low in the frame, where
the grass is thickest, gets a frosted veil rather than only a text halo.

## Content

Everything I'd edit lives in `src/data/content.ts` and nowhere else. Fill it from
the résumé I'm pasting below; mark anything you invent or estimate `PLACEHOLDER`.
Favicon: a five-lobed bloom on dusk sky in the palette's own hexes, kept to five
fat lobes and one warm core so it survives 16px. Set the real `<title>`,
description and Open Graph tags in `index.html`.

[paste résumé here]

## Verify before you tell me it's done

Drive the real page with Playwright + SwiftShader (install it *outside* the
project so it doesn't land in my deps): screenshot the hero, a cursor sweep, each
section, mid-scroll, full bloom, and mobile 390×844. Confirm zero console/page
errors and a clean `npm run build`. Prove the world actually animates by hashing
the same clip of far grass twice with the pointer parked — if the hashes match,
gotcha 1 above is broken. Do not create a repo, push, or deploy — I'll do that.

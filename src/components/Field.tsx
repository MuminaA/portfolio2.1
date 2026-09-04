import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { GUST, NOISE, ROT2, WIND } from '../lib/glsl'
import { COLOR_KEYS, STOPS, segmentAt } from '../lib/palette'
import type { ColorKey } from '../lib/palette'
import { prefersReducedMotion, tracker } from '../lib/tracker'

/* ── the meadow's footprint ─────────────────────────────────────────────────
   Blades are scattered from just behind the camera out to the far plane, with
   the spread widening as it recedes so density stays even in *screen* space
   rather than in world space.                                                 */
const NEAR_Z = 7
const FAR_Z = -95
const FOG_NEAR = 30
const FOG_FAR = 106

/** Rolling ground. Static in time — terrain that breathes looks like water. */
const GROUND = /* glsl */ `
uniform vec2 uCamXZ;

float groundAt(vec2 xz) {
  float h  = fw_noise(vec3(xz * 0.019, 0.0)) * 1.95;
  h += fw_noise(vec3(xz * 0.054 + 9.0, 0.0)) * 0.55;
  // Flattened right around the camera so hills never swallow it, rolling further out.
  float rise = smoothstep(5.0, 42.0, distance(xz, uCamXZ));
  return h * (0.10 + rise * 1.05);
}
`

/* The earth itself. Without this the gaps between blades show the *sky* through
   the canvas, which reads as pale sand rather than ground. It is drawn before
   the grass and carries its own fine noise so it looks like turf up close. */
const GROUND_VERT = /* glsl */ `
uniform float uFogNear;
uniform float uFogFar;

varying float vFog;
varying vec2 vXZ;

${NOISE}
${GROUND}

void main() {
  vec2 xz = position.xz;
  vXZ = xz;
  vec3 p = vec3(position.x, groundAt(xz), position.z);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vFog = smoothstep(uFogNear, uFogFar, -mv.z);
  gl_Position = projectionMatrix * mv;
}
`

const GROUND_FRAG = /* glsl */ `
uniform vec3 uGrassBase;
uniform vec3 uGrassTip;
uniform vec3 uHaze;

varying float vFog;
varying vec2 vXZ;

${NOISE}

void main() {
  float n  = fw_noise(vec3(vXZ * 1.9, 0.0)) * 0.5 + 0.5;
  float n2 = fw_noise(vec3(vXZ * 8.5 + 13.0, 0.0)) * 0.5 + 0.5;
  float tex = clamp(n * 0.62 + n2 * 0.38, 0.0, 1.0);

  // Darker than the blades standing on it, so the grass still reads against it.
  vec3 col = mix(uGrassBase * 0.62, uGrassTip * 0.74, tex);
  col = mix(col, uHaze, vFog * 0.95);

  gl_FragColor = vec4(col, 1.0 - smoothstep(0.84, 1.0, vFog));
  #include <colorspace_fragment>
}
`

const GRASS_VERT = /* glsl */ `
attribute float aSeg;
attribute float aRand;

uniform float uFogNear;
uniform float uFogFar;

varying float vSeg;
varying float vRand;
varying float vFog;
varying float vGlow;
varying float vNear;

${NOISE}
${WIND}
${GUST}
${GROUND}

float hash11(float p) { return fract(sin(p * 127.1) * 43758.5453); }

void main() {
  vec2 xz = position.xz;
  float t = aSeg;
  float h = 0.42 + aRand * 0.52;

  vec3 p = vec3(position.x, groundAt(xz) + t * h, position.z);

  // Every blade leans slightly off the prevailing wind, or the field looks combed.
  vec2 lean = vec2(hash11(aRand * 13.7) - 0.5, hash11(aRand * 29.3) - 0.5);
  vec2 wdir = normalize(uWindDir + lean * 0.55);

  float w = windAt(xz);
  float bend = pow(t, 1.55) * h * (0.28 + w * 0.9);
  p.xz += wdir * bend;

  vec2 gdir;
  vec2 gust = gustAt(xz, gdir);
  p.xz += gdir * (pow(t, 1.4) * h * gust.x * 1.9);

  // A bent blade is shorter in silhouette; without this they visibly stretch.
  p.y -= pow(t, 2.2) * h * (abs(bend) * 0.55 + gust.x * 0.3);

  vSeg = t;
  vRand = aRand;
  vGlow = gust.y;

  // Blades right under the lens span most of the frame and read as scratches
  // rather than grass. Fade them into the ground plane instead of drawing them.
  vNear = mix(0.06, 1.0, smoothstep(1.6, 7.5, distance(xz, uCamXZ)));

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vFog = smoothstep(uFogNear, uFogFar, -mv.z);
  gl_Position = projectionMatrix * mv;
}
`

const GRASS_FRAG = /* glsl */ `
uniform vec3 uGrassBase;
uniform vec3 uGrassTip;
uniform vec3 uHaze;
uniform vec3 uSun;

varying float vSeg;
varying float vRand;
varying float vFog;
varying float vGlow;
varying float vNear;

void main() {
  float shade = 0.72 + vRand * 0.56;
  vec3 col = mix(uGrassBase, uGrassTip, clamp(vSeg * 1.18 * shade, 0.0, 1.0));

  // Grass caught in a gust catches the light too.
  col += uSun * vGlow * 0.30;

  // Dissolve into the haze so the horizon meets the sky without a hard seam.
  col = mix(col, uHaze, vFog * 0.94);

  float a = (1.0 - smoothstep(0.76, 1.0, vFog)) * (0.60 + vRand * 0.32) * vNear;
  gl_FragColor = vec4(col, a);
  #include <colorspace_fragment>
}
`

const PETAL_VERT = /* glsl */ `
attribute float aAngle;
attribute float aRand;

uniform float uSize;
uniform float uDpr;

varying float vAngle;
varying float vRand;

void main() {
  vAngle = aAngle;
  vRand = aRand;

  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (0.62 + aRand * 0.7) * uDpr * (26.0 / max(-mv.z, 0.001));
}
`

const PETAL_FRAG = /* glsl */ `
uniform vec3 uPetal;
uniform vec3 uPetalLight;

varying float vAngle;
varying float vRand;

${ROT2}

void main() {
  vec2 q = rot2(vAngle) * ((gl_PointCoord - 0.5) * 2.0);

  // A teardrop: rounded at the base, narrowing to a soft tip. A radial
  // falloff rather than a box, or the silhouette reads as a torn paper wedge.
  float k = clamp(q.y * 0.5 + 0.5, 0.0, 1.0);
  float halfW = mix(0.58, 0.22, k * k);
  float rx = q.x / halfW;
  float d = sqrt(rx * rx + q.y * q.y);
  float m = 1.0 - smoothstep(0.52, 1.0, d);
  if (m <= 0.004) discard;

  // Only a touch of the pale tone. Biased white, they stop reading as petals.
  vec3 col = mix(uPetal, uPetalLight, vRand * 0.34 + (1.0 - k) * 0.16);
  gl_FragColor = vec4(col, m * (0.72 + vRand * 0.22));
  #include <colorspace_fragment>
}
`

/* ── geometry ──────────────────────────────────────────────────────────────── */

const SEGMENTS = 3

function buildMeadow(blades: number) {
  // Scatter first, then sort front-to-back. Depth testing is off (thin alpha
  // lines and a depth buffer do not mix), so draw order *is* the sort order.
  const bases: { x: number; z: number; r: number }[] = new Array(blades)
  for (let i = 0; i < blades; i++) {
    const u = Math.random()
    const z = NEAR_Z - (NEAR_Z - FAR_Z) * Math.pow(u, 1.6)
    const halfX = 2 + (NEAR_Z - z) * 0.82
    bases[i] = { x: (Math.random() * 2 - 1) * halfX, z, r: Math.random() }
  }
  bases.sort((a, b) => a.z - b.z)

  const verts = blades * SEGMENTS * 2
  const position = new Float32Array(verts * 3)
  const aSeg = new Float32Array(verts)
  const aRand = new Float32Array(verts)

  let v = 0
  for (const b of bases) {
    for (let s = 0; s < SEGMENTS; s++) {
      for (const end of [s, s + 1]) {
        position[v * 3 + 0] = b.x
        position[v * 3 + 1] = 0
        position[v * 3 + 2] = b.z
        aSeg[v] = end / SEGMENTS
        aRand[v] = b.r
        v++
      }
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(position, 3))
  geo.setAttribute('aSeg', new THREE.BufferAttribute(aSeg, 1))
  geo.setAttribute('aRand', new THREE.BufferAttribute(aRand, 1))
  // Vertices move in the shader, so three's own culling maths cannot be trusted.
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, -30), 140)
  return geo
}

/**
 * A displaced grid for the earth. Wide enough that the edges never enter the
 * frustum, and long enough to reach past the blades so the horizon is ground
 * meeting sky rather than grass stopping in mid-air.
 */
function buildGround(cols = 168, rows = 118) {
  const HALF_X = 118
  const Z_NEAR = NEAR_Z + 4
  const Z_FAR = FAR_Z - 12

  const position = new Float32Array((cols + 1) * (rows + 1) * 3)
  let v = 0
  for (let j = 0; j <= rows; j++) {
    const z = Z_NEAR + ((Z_FAR - Z_NEAR) * j) / rows
    for (let i = 0; i <= cols; i++) {
      position[v++] = -HALF_X + (2 * HALF_X * i) / cols
      position[v++] = 0
      position[v++] = z
    }
  }

  const index = new Uint32Array(cols * rows * 6)
  let n = 0
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const a = j * (cols + 1) + i
      const b = a + 1
      const c = a + cols + 1
      const d = c + 1
      index[n++] = a
      index[n++] = c
      index[n++] = b
      index[n++] = b
      index[n++] = c
      index[n++] = d
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(position, 3))
  geo.setIndex(new THREE.BufferAttribute(index, 1))
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, -40), 180)
  return geo
}

function buildPetals(count: number) {
  const position = new Float32Array(count * 3)
  const aAngle = new Float32Array(count)
  const aRand = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    aRand[i] = Math.random()
    // Start them off-screen; the first frame of the trail places them properly.
    position[i * 3 + 1] = -50
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(position, 3))
  geo.setAttribute('aAngle', new THREE.BufferAttribute(aAngle, 1))
  geo.setAttribute('aRand', new THREE.BufferAttribute(aRand, 1))
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 60)
  return geo
}

/* ── the arc, as three.js colours ──────────────────────────────────────────── */

/**
 * The same palette stops the CSS uses, pre-parsed into linear-space colours.
 * Lerped into a scratch colour each frame — building THREE.Color from a hex
 * string every frame would allocate 9 objects per frame.
 */
function buildStopColors() {
  return STOPS.map((stop) => {
    const out = {} as Record<ColorKey, THREE.Color>
    for (const key of COLOR_KEYS) out[key] = new THREE.Color(stop.colors[key])
    return out
  })
}

/* ── scene ─────────────────────────────────────────────────────────────────── */

type SceneProps = { reduced: boolean; tier: 'high' | 'low' }

function Scene({ reduced, tier }: SceneProps) {
  const { camera } = useThree()

  const bladeCount = tier === 'high' ? 26000 : 9000
  const petalCount = tier === 'high' ? 110 : 52

  const meadowGeo = useMemo(() => buildMeadow(bladeCount), [bladeCount])
  const petalGeo = useMemo(() => buildPetals(petalCount), [petalCount])
  const groundGeo = useMemo(
    () => (tier === 'high' ? buildGround() : buildGround(110, 78)),
    [tier],
  )

  useEffect(
    () => () => {
      meadowGeo.dispose()
      petalGeo.dispose()
      groundGeo.dispose()
    },
    [meadowGeo, petalGeo, groundGeo],
  )

  const stops = useMemo(buildStopColors, [])

  const shared = useMemo(
    () => ({
      uTime: { value: 0 },
      uWindDir: { value: new THREE.Vector2(0.82, -0.57) },
      uWindStrength: { value: 1 },
      uGust: { value: new THREE.Vector2(0, -12) },
      uGustAmp: { value: 0 },
      uRing: { value: 0 },
      uRingAmp: { value: 0 },
      uCamXZ: { value: new THREE.Vector2(0, NEAR_Z) },
      uFogNear: { value: FOG_NEAR },
      uFogFar: { value: FOG_FAR },
      uGrassBase: { value: new THREE.Color() },
      uGrassTip: { value: new THREE.Color() },
      uHaze: { value: new THREE.Color() },
      uSun: { value: new THREE.Color() },
    }),
    [],
  )

  const petalUniforms = useMemo(
    () => ({
      uPetal: { value: new THREE.Color() },
      uPetalLight: { value: new THREE.Color() },
      uSize: { value: tier === 'high' ? 2.3 : 2.4 },
      uDpr: { value: Math.min(window.devicePixelRatio || 1, 1.75) },
    }),
    [tier],
  )

  /* The head of the petal trail, and its recent history. Petal i samples the
     history at a delay proportional to i, which is what makes the ribbon. */
  const HIST = 420
  const trail = useRef({
    head: new THREE.Vector3(0, 1.4, 2),
    hist: new Float32Array(HIST * 3),
    write: 0,
    filled: false,
    idle: 0,
  })

  const scratch = useMemo(
    () => ({ v: new THREE.Vector3(), target: new THREE.Vector3(), ray: new THREE.Vector3() }),
    [],
  )

  /* lookY sits well above the camera so the lens tilts *up*, dropping the
     horizon to roughly 58% of the frame. The meadow then occupies the lower
     third instead of half the page, and text has sky to sit against. */
  const eased = useRef({ camX: 0, camY: 1.1, lookY: 3.5, gustAmp: 0 })

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20)
    const ease = (rate: number) => 1 - Math.pow(rate, dt)
    const cam = camera as THREE.PerspectiveCamera
    const t = trail.current

    shared.uTime.value += reduced ? dt * 0.25 : dt

    /* ── pointer ─────────────────────────────────────────────────────────── */
    tracker.sx += (tracker.px - tracker.sx) * ease(0.004)
    tracker.sy += (tracker.py - tracker.sy) * ease(0.004)
    tracker.speed *= Math.pow(0.06, dt)

    let ndcX = tracker.sx
    let ndcY = tracker.sy
    if (!tracker.hasPointer) {
      // Touch, or nobody has moved yet: let the wind carry itself.
      t.idle += dt
      ndcX = Math.sin(t.idle * 0.21) * 0.62
      ndcY = Math.cos(t.idle * 0.16) * 0.42 + 0.1
    }

    /* ── camera: a slow, shallow drift. Flower's camera never snaps. ─────── */
    const e = eased.current
    if (!reduced) {
      e.camX += (ndcX * 0.85 - e.camX) * ease(0.06)
      e.camY += (1.1 + ndcY * 0.26 - e.camY) * ease(0.06)
      e.lookY += (3.5 + ndcY * 0.42 - e.lookY) * ease(0.06)
    }
    cam.position.set(e.camX, e.camY, NEAR_Z - 0.2)
    cam.lookAt(e.camX * 0.45, e.lookY, -22)
    shared.uCamXZ.value.set(cam.position.x, cam.position.z)

    /* ── where the pointer meets the world ───────────────────────────────── */
    const halfH = Math.tan(((cam.fov * Math.PI) / 180) / 2)
    const D = 4.6
    scratch.target
      .set(ndcX * halfH * cam.aspect * D, ndcY * halfH * D, -D)
      .applyMatrix4(cam.matrixWorld)
    // Depth testing is off, so a petal below the earth would still be drawn on
    // top of it. Keep the trail airborne.
    scratch.target.y = Math.max(scratch.target.y, 0.95)

    // Cast that through to the ground plane for the grass gust. Above the
    // horizon the ray never lands, so it is clamped to a distant point instead.
    scratch.ray.copy(scratch.target).sub(cam.position).normalize()
    const hit = scratch.ray.y < -1e-3 ? -cam.position.y / scratch.ray.y : Infinity
    const along = Math.min(Math.max(hit, 1), 70)
    shared.uGust.value.set(
      cam.position.x + scratch.ray.x * along,
      cam.position.z + scratch.ray.z * along,
    )

    e.gustAmp += ((0.35 + tracker.speed * 1.5) - e.gustAmp) * ease(0.05)
    shared.uGustAmp.value = reduced ? 0.2 : e.gustAmp

    /* ── click: a gust ring rolling outward across the meadow ────────────── */
    const age = (performance.now() - tracker.clickAt) / 1600
    if (age >= 0 && age <= 1) {
      shared.uRing.value = age * 34
      shared.uRingAmp.value = Math.pow(1 - age, 1.6)
    } else {
      shared.uRingAmp.value = 0
    }

    // Wind swings slowly through a narrow arc; a fixed direction reads as a fan.
    const swing = Math.sin(shared.uTime.value * 0.06) * 0.45
    shared.uWindDir.value.set(Math.cos(-0.6 + swing), Math.sin(-0.6 + swing))
    shared.uWindStrength.value = reduced ? 0.35 : 1

    /* ── palette: dusk → bloom, driven by smoothed scroll ────────────────── */
    const { lo, hi, u } = segmentAt(tracker.bloom)
    const a = stops[lo]
    const b = stops[hi]
    shared.uGrassBase.value.copy(a.grassBase).lerp(b.grassBase, u)
    shared.uGrassTip.value.copy(a.grassTip).lerp(b.grassTip, u)
    shared.uHaze.value.copy(a.haze).lerp(b.haze, u)
    shared.uSun.value.copy(a.sun).lerp(b.sun, u)
    petalUniforms.uPetal.value.copy(a.petal).lerp(b.petal, u)
    petalUniforms.uPetalLight.value.copy(a.petalLight).lerp(b.petalLight, u)

    /* ── the petal trail ─────────────────────────────────────────────────── */
    t.head.lerp(scratch.target, ease(0.0015))

    t.hist[t.write * 3 + 0] = t.head.x
    t.hist[t.write * 3 + 1] = t.head.y
    t.hist[t.write * 3 + 2] = t.head.z
    t.write = (t.write + 1) % HIST
    if (t.write === 0) t.filled = true

    const pos = petalGeo.attributes.position as THREE.BufferAttribute
    const ang = petalGeo.attributes.aAngle as THREE.BufferAttribute
    const posArr = pos.array as Float32Array
    const angArr = ang.array as Float32Array
    const rndArr = petalGeo.attributes.aRand.array as Float32Array
    const available = t.filled ? HIST : Math.max(t.write, 1)
    const time = shared.uTime.value
    const lagStep = (HIST - 24) / petalCount

    // Slot order is draw order. Slot 0 is the far tail and slot n-1 is the head,
    // so the newest petals paint over the oldest. Because the lag is derived
    // from the slot rather than shuffled into it, aRand can stay static — colour
    // and size remain pinned to their petal and the buffer is never rewritten.
    for (let s = 0; s < petalCount; s++) {
      const i = petalCount - 1 - s
      const r = rndArr[s]

      // Step is derived from the count so the trail spans the same slice of
      // history on both tiers — a fixed step leaves the low tier in a tight clump.
      const lag = Math.min(available - 1, Math.round(i * lagStep + r * lagStep * 0.9))
      const idx = (t.write - 1 - lag + HIST * 2) % HIST

      // A private orbit per petal, so the ribbon has volume instead of being a wire.
      const ph = r * 90
      const spread = 0.18 + (i / petalCount) * 0.85
      posArr[s * 3 + 0] = t.hist[idx * 3 + 0] + Math.sin(time * (0.7 + r * 0.8) + ph) * spread
      posArr[s * 3 + 1] =
        t.hist[idx * 3 + 1] + Math.cos(time * (0.55 + r * 0.6) + ph * 1.3) * spread * 0.7
      posArr[s * 3 + 2] =
        t.hist[idx * 3 + 2] + Math.sin(time * (0.45 + r * 0.5) + ph * 0.7) * spread * 0.6
      angArr[s] = time * (0.5 + r * 1.6) + ph
    }
    pos.needsUpdate = true
    ang.needsUpdate = true
  })

  return (
    <>
      {/* Explicit order: depth testing is off throughout, so the only thing
          keeping earth behind grass behind petals is the sequence of draws. */}
      <mesh geometry={groundGeo} frustumCulled={false} renderOrder={0}>
        <shaderMaterial
          uniforms={shared}
          vertexShader={GROUND_VERT}
          fragmentShader={GROUND_FRAG}
          transparent
          depthTest={false}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <lineSegments geometry={meadowGeo} frustumCulled={false} renderOrder={1}>
        <shaderMaterial
          uniforms={shared}
          vertexShader={GRASS_VERT}
          fragmentShader={GRASS_FRAG}
          transparent
          depthTest={false}
          depthWrite={false}
        />
      </lineSegments>

      <points geometry={petalGeo} frustumCulled={false} renderOrder={2}>
        <shaderMaterial
          uniforms={petalUniforms}
          vertexShader={PETAL_VERT}
          fragmentShader={PETAL_FRAG}
          transparent
          depthTest={false}
          depthWrite={false}
        />
      </points>
    </>
  )
}

export default function Field() {
  const reduced = useMemo(prefersReducedMotion, [])
  const tier: 'high' | 'low' = useMemo(() => {
    if (typeof window === 'undefined') return 'low'
    const cores = navigator.hardwareConcurrency ?? 4
    return window.innerWidth < 760 || cores <= 4 ? 'low' : 'high'
  }, [])

  return (
    <div className="field" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        frameloop="always"
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: 58, position: [0, 1.1, NEAR_Z - 0.2], near: 0.1, far: 130 }}
      >
        <Scene reduced={reduced} tier={tier} />
      </Canvas>
    </div>
  )
}

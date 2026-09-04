import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { prefersReducedMotion, tracker } from '../lib/tracker'

/* ── geometry extents in world units ────────────────────────────────────────
   The grid is deliberately larger than the visible frustum so its edges never
   enter frame, even on ultrawide displays.                                    */
const EXTENT_X = 21
const EXTENT_Y = 13

/* ── shader source ─────────────────────────────────────────────────────────── */

/** Ashima simplex noise, 3D. Prefixed to avoid colliding with three's chunks. */
const NOISE = /* glsl */ `
vec3 sn_mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 sn_mod289(vec4 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 sn_permute(vec4 x){ return sn_mod289(((x * 34.0) + 1.0) * x); }
vec4 sn_taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float sn_noise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = sn_mod289(i);
  vec4 p = sn_permute(sn_permute(sn_permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = sn_taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`

/**
 * The shared displacement. Both the point cloud and the wireframe run this so
 * the two layers stay welded to the same surface.
 */
const DISPLACE = /* glsl */ `
uniform float uTime;
uniform vec2  uPointer;
uniform float uScroll;
uniform float uRing;
uniform float uRingAmp;

vec3 fieldPoint(vec3 basePos, out float glow, out float height) {
  vec3 p = basePos;
  float t = uTime * 0.075;

  // three octaves of drift — broad swells, mid detail, fine shimmer
  float n  = sn_noise(vec3(p.xy * 0.15, t));
  n += sn_noise(vec3(p.xy * 0.40 + 17.0, t * 1.7)) * 0.42;
  n += sn_noise(vec3(p.xy * 1.00 + 51.0, t * 2.4)) * 0.15;

  // travelling wave bound to scroll: descending the page drives the terrain
  n += sin(p.y * 0.30 - uScroll * 16.0 + uTime * 0.45) * 0.28;

  height = n;
  p.z += n * 2.1;

  // cursor: a standing well that shoves nodes outward and lifts them
  vec2 toP = p.xy - uPointer;
  float d = length(toP);
  vec2 dir = d > 1e-4 ? toP / d : vec2(0.0);

  float pull = exp(-d * d * 0.05);
  // click: an expanding annulus, faded out by uRingAmp
  float ring = exp(-pow(d - uRing, 2.0) * 0.55) * uRingAmp;

  p.xy += dir * (pull * 1.25 + ring * 1.5);
  p.z  += pull * 2.8 + ring * 3.6;

  glow = clamp(pull * 1.3 + ring * 1.8, 0.0, 2.0);
  return p;
}
`

const POINT_VERT = /* glsl */ `
attribute float aRand;
uniform float uSize;
uniform float uDpr;
varying float vGlow;
varying float vHeight;
varying float vRand;

${NOISE}
${DISPLACE}

void main() {
  float glow, height;
  vec3 p = fieldPoint(position, glow, height);

  vGlow = glow;
  vHeight = height;
  vRand = aRand;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  float s = uSize * (0.45 + aRand * 0.95) * (1.0 + glow * 1.6);
  gl_PointSize = s * uDpr * (18.0 / max(-mv.z, 0.001));
}
`

const POINT_FRAG = /* glsl */ `
uniform vec3  uColorA;
uniform vec3  uColorB;
uniform vec3  uColorC;
uniform float uPaletteMix;
uniform float uDim;
varying float vGlow;
varying float vHeight;
varying float vRand;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float r = length(uv);
  if (r > 0.5) discard;

  float core = smoothstep(0.5, 0.0, r);
  float alpha = pow(core, 2.0);

  float h = clamp(vHeight * 0.5 + 0.5, 0.0, 1.0);
  vec3 col = mix(uColorA, uColorB, smoothstep(0.15, 0.85, h));
  col = mix(col, uColorC, uPaletteMix * smoothstep(0.20, 0.80, h));

  // per-particle brightness variance, then a cyan-tinted lift near the cursor.
  // Adding white here instead would desaturate the whole field to a starfield.
  col *= 0.45 + vRand * 0.55;
  col += uColorA * vGlow * 0.55;
  // only the very hottest core is allowed to clip to white
  col = mix(col, vec3(1.0), clamp(vGlow - 0.85, 0.0, 1.0) * 0.6);

  float a = alpha * (0.22 + vGlow * 0.62) * (0.4 + vRand * 0.6) * uDim;
  gl_FragColor = vec4(col, a);
  #include <colorspace_fragment>
}
`

const LINE_VERT = /* glsl */ `
varying float vGlow;
varying float vHeight;

${NOISE}
${DISPLACE}

void main() {
  float glow, height;
  vec3 p = fieldPoint(position, glow, height);
  vGlow = glow;
  vHeight = height;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`

const LINE_FRAG = /* glsl */ `
uniform vec3  uColorA;
uniform vec3  uColorB;
uniform vec3  uColorC;
uniform float uPaletteMix;
uniform float uDim;
varying float vGlow;
varying float vHeight;

void main() {
  float h = clamp(vHeight * 0.45 + 0.5, 0.0, 1.0);
  vec3 col = mix(uColorA, uColorB, smoothstep(0.40, 1.00, h));
  col = mix(col, uColorC, uPaletteMix * 0.7);
  col += uColorA * vGlow * 0.45;

  float a = (0.045 + vGlow * 0.18) * uDim;
  gl_FragColor = vec4(col, a);
  #include <colorspace_fragment>
}
`

/* ── geometry ──────────────────────────────────────────────────────────────── */

function buildPointGrid(cols: number, rows: number) {
  const count = cols * rows
  const positions = new Float32Array(count * 3)
  const rands = new Float32Array(count)

  const stepX = (2 * EXTENT_X) / (cols - 1)
  const stepY = (2 * EXTENT_Y) / (rows - 1)

  let i = 0
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      // jitter breaks up the moiré you get from a perfectly regular lattice
      positions[i * 3 + 0] = -EXTENT_X + x * stepX + (Math.random() - 0.5) * stepX * 0.9
      positions[i * 3 + 1] = -EXTENT_Y + y * stepY + (Math.random() - 0.5) * stepY * 0.9
      positions[i * 3 + 2] = 0
      rands[i] = Math.random()
      i++
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('aRand', new THREE.BufferAttribute(rands, 1))
  // the shader displaces vertices, so let three skip its own culling maths
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 60)
  return geo
}

function buildWireGrid(cols: number, rows: number) {
  const verts: number[] = []
  const gx = (i: number) => -EXTENT_X + (i / (cols - 1)) * 2 * EXTENT_X
  const gy = (j: number) => -EXTENT_Y + (j / (rows - 1)) * 2 * EXTENT_Y

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols - 1; i++) {
      verts.push(gx(i), gy(j), 0, gx(i + 1), gy(j), 0)
    }
  }
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows - 1; j++) {
      verts.push(gx(i), gy(j), 0, gx(i), gy(j + 1), 0)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 60)
  return geo
}

/* ── scene ─────────────────────────────────────────────────────────────────── */

type SceneProps = { reduced: boolean; tier: 'high' | 'low' }

function Scene({ reduced, tier }: SceneProps) {
  const { camera } = useThree()

  const pointGeo = useMemo(
    () => (tier === 'high' ? buildPointGrid(210, 128) : buildPointGrid(120, 76)),
    [tier],
  )
  const wireGeo = useMemo(
    () => (tier === 'high' ? buildWireGrid(48, 30) : buildWireGrid(30, 20)),
    [tier],
  )

  useEffect(() => {
    return () => {
      pointGeo.dispose()
      wireGeo.dispose()
    }
  }, [pointGeo, wireGeo])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uScroll: { value: 0 },
      uRing: { value: 0 },
      uRingAmp: { value: 0 },
      uSize: { value: tier === 'high' ? 2.5 : 3.4 },
      uDpr: { value: Math.min(window.devicePixelRatio || 1, 1.75) },
      uPaletteMix: { value: 0 },
      uDim: { value: 1 },
      uColorA: { value: new THREE.Color('#00e5ff') },
      uColorB: { value: new THREE.Color('#ff2e6b') },
      uColorC: { value: new THREE.Color('#b9ff3d') },
    }),
    [tier],
  )

  const idleRef = useRef(0)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20)
    const u = uniforms

    u.uTime.value += reduced ? dt * 0.15 : dt

    // exponential smoothing, framerate independent
    const ease = (rate: number) => 1 - Math.pow(rate, dt)

    tracker.sx += (tracker.px - tracker.sx) * ease(0.002)
    tracker.sy += (tracker.py - tracker.sy) * ease(0.002)

    const cam = camera as THREE.PerspectiveCamera
    const halfH = Math.tan(((cam.fov * Math.PI) / 180) / 2) * 16
    const halfW = halfH * cam.aspect

    if (tracker.hasPointer) {
      u.uPointer.value.set(tracker.sx * halfW, tracker.sy * halfH)
    } else {
      // no pointer (touch, or nobody has moved yet): drift the well on its own
      idleRef.current += dt
      const t = idleRef.current
      u.uPointer.value.set(
        Math.sin(t * 0.23) * halfW * 0.55,
        Math.cos(t * 0.17) * halfH * 0.55,
      )
    }

    u.uScroll.value += (tracker.scroll - u.uScroll.value) * ease(0.01)

    const age = (performance.now() - tracker.clickAt) / 1200
    if (age >= 0 && age <= 1) {
      u.uRing.value = age * 18
      u.uRingAmp.value = Math.pow(1 - age, 1.5)
    } else {
      u.uRingAmp.value = 0
    }

    u.uPaletteMix.value += (tracker.palette - u.uPaletteMix.value) * ease(0.05)

    // The hero is the showcase; past it the field steps back so body copy can
    // be read without fighting a bright particle cloud behind it.
    const k = Math.min(1, Math.max(0, (u.uScroll.value - 0.02) / 0.14))
    u.uDim.value = 1 - 0.78 * (k * k * (3 - 2 * k))

    if (!reduced) {
      cam.position.x += (tracker.sx * 0.55 - cam.position.x) * ease(0.02)
      cam.position.y += (tracker.sy * 0.4 - cam.position.y) * ease(0.02)
      cam.lookAt(0, 0, 0)
    }
  })

  return (
    <>
      <lineSegments geometry={wireGeo} frustumCulled={false}>
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={LINE_VERT}
          fragmentShader={LINE_FRAG}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      <points geometry={pointGeo} frustumCulled={false}>
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={POINT_VERT}
          fragmentShader={POINT_FRAG}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
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
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: 52, position: [0, 0, 16], near: 0.1, far: 80 }}
      >
        <Scene reduced={reduced} tier={tier} />
      </Canvas>
    </div>
  )
}

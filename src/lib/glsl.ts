/**
 * Shared GLSL. Kept out of the components so the meadow and the petals run the
 * same wind — if they disagreed, the petals would visibly ignore the gusts
 * moving through the grass underneath them.
 */

/** Ashima simplex noise, 3D. Prefixed to avoid colliding with three's chunks. */
export const NOISE = /* glsl */ `
vec3 fw_mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 fw_mod289(vec4 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 fw_permute(vec4 x){ return fw_mod289(((x * 34.0) + 1.0) * x); }
vec4 fw_taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float fw_noise(vec3 v) {
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

  i = fw_mod289(i);
  vec4 p = fw_permute(fw_permute(fw_permute(
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

  vec4 norm = fw_taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`

/**
 * The wind. Three octaves advected along uWindDir, so gusts read as broad bands
 * travelling across the meadow rather than as local wobble.
 *
 * The wind runs on its own slower clock. Scaling it here rather than slowing the
 * shared `uTime` keeps everything else on that clock at the pace it was tuned
 * for — the firefly blink, the flower flash, the petals' noise orbits — all of
 * which read wrong if they drift out of step with the grass. One knob, and it
 * only moves the grass.
 *
 * Interpolated via toFixed, not raw: a whole number stringifies to `1`, and GLSL
 * ES will not multiply a float by an int literal, so the shader would fail to
 * compile and the grass would simply stop existing.
 */
const WIND_RATE = (0.5).toFixed(3)

export const WIND = /* glsl */ `
uniform float uTime;
uniform vec2  uWindDir;
uniform float uWindStrength;

float windAt(vec2 xz) {
  float wt = uTime * ${WIND_RATE};
  vec2 flow = xz - uWindDir * wt * 3.4;
  float w  = fw_noise(vec3(flow * 0.052, wt * 0.09));
  w += fw_noise(vec3(flow * 0.135 + 21.0, wt * 0.16)) * 0.50;
  w += fw_noise(vec3(flow * 0.360 + 47.0, wt * 0.25)) * 0.22;
  return w * uWindStrength;
}
`

/**
 * The pointer's influence on the ground plane: a soft local well that pushes
 * blades away from the cursor, plus an expanding annulus fired on click.
 */
export const GUST = /* glsl */ `
uniform vec2  uGust;
uniform float uGustAmp;
uniform float uRing;
uniform float uRingAmp;

// x = outward push, y = highlight amount
vec2 gustAt(vec2 xz, out vec2 dir) {
  vec2 toB = xz - uGust;
  float d = length(toB);
  dir = d > 1e-4 ? toB / d : vec2(0.0, 1.0);

  float local = exp(-d * d * 0.055) * uGustAmp;
  float ring = exp(-pow(d - uRing, 2.0) * 0.22) * uRingAmp;

  return vec2(local * 0.85 + ring * 1.25, local * 1.1 + ring * 1.6);
}
`

export const ROT2 = /* glsl */ `
mat2 rot2(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}
`

/**
 * Petal colour, spread around whatever hue the palette is currently on.
 *
 * `tint` runs 0 → 1 with the sunrise. At 0 every petal is exactly the palette's
 * own colour, which is what keeps the dormant field colourless; as the sun comes
 * up they fan out into a bouquet.
 *
 * The hue offsets are quantised into five buckets rather than taken straight
 * from the random value. A continuous rainbow puts most petals in the muddy
 * in-betweens — olive, teal, mauve — where five chosen hues read as deliberate.
 * The five land on blue-violet, violet, pink, orange and gold: wide enough to
 * be obviously several colours, and stopping short of green and true blue,
 * which vanish into the grass and the sky respectively.
 */
export const PETAL_TINT = /* glsl */ `
vec3 fw_rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + 1e-10)), d / (q.x + 1e-10), q.x);
}

vec3 fw_hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 petalTint(vec3 base, float rand, float tint) {
  if (tint <= 0.001) return base;

  vec3 hsv = fw_rgb2hsv(base);
  float bucket = floor(rand * 5.0);
  hsv.x = fract(hsv.x + (bucket - 2.15) * 0.115 * tint);
  /* A grey base has no hue worth spreading, so saturation has to be *added*,
     not scaled — at dusk the petal stop is nearly colourless on purpose. It is
     pushed hard because these colours are mixed in linear space: a saturation of
     0.6 there still lands as something pastel once it is encoded to sRGB. */
  hsv.y = mix(hsv.y, clamp(hsv.y * 1.15 + 0.55, 0.0, 0.97), tint);
  hsv.z = mix(hsv.z, min(hsv.z * 1.06 + 0.05, 1.0), tint);
  return fw_hsv2rgb(hsv);
}
`

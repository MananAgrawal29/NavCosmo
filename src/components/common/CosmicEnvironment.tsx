import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

const GALACTIC_NORMAL = new THREE.Vector3(0.34, 0.82, -0.46).normalize()
const GALACTIC_CORE = new THREE.Vector3(-0.72, -0.12, 0.68).normalize()

function mulberry32(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function randomDirection(rand: () => number): THREE.Vector3 {
  const y = rand() * 2 - 1
  const theta = rand() * Math.PI * 2
  const r = Math.sqrt(Math.max(0, 1 - y * y))
  return new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta))
}

// Pulls a direction toward the galactic plane so star density varies naturally
// instead of looking evenly painted onto a sphere.
function bandBiasedDirection(rand: () => number, strength: number): THREE.Vector3 {
  const direction = randomDirection(rand)
  const normalComponent = direction.dot(GALACTIC_NORMAL)
  return direction
    .addScaledVector(GALACTIC_NORMAL, -normalComponent * strength)
    .normalize()
}

const STAR_TINTS: [number, number, number][] = [
  [1, 0.975, 0.94],
  [1, 1, 1],
  [0.94, 0.96, 1],
  [1, 0.955, 0.9],
  [0.98, 0.98, 0.98],
]

function starColor(rand: () => number, brightness: number, target: Float32Array, index: number) {
  const tint = STAR_TINTS[Math.floor(rand() * STAR_TINTS.length)]
  const desaturate = 0.55
  target[index] = THREE.MathUtils.lerp(1, tint[0], desaturate) * brightness
  target[index + 1] = THREE.MathUtils.lerp(1, tint[1], desaturate) * brightness
  target[index + 2] = THREE.MathUtils.lerp(1, tint[2], desaturate) * brightness
}

interface StarLayer {
  count: number
  radiusMin: number
  radiusMax: number
  sizeMin: number
  sizeMax: number
  brightnessMin: number
  brightnessMax: number
  bandStrength: number
  seed: number
}

const STAR_LAYERS: StarLayer[] = [
  {
    // Faint distant dust: the bulk of the perceived depth.
    count: 2200,
    radiusMin: 104,
    radiusMax: 138,
    sizeMin: 1.2,
    sizeMax: 2,
    brightnessMin: 0.26,
    brightnessMax: 0.52,
    bandStrength: 0.45,
    seed: 20260,
  },
  {
    // Mid-field stars with a little more presence.
    count: 1750,
    radiusMin: 72,
    radiusMax: 116,
    sizeMin: 1.5,
    sizeMax: 2.6,
    brightnessMin: 0.42,
    brightnessMax: 0.78,
    bandStrength: 0.3,
    seed: 771,
  },
  {
    // Sparse bright icons; capped size keeps them points, not glows.
    count: 420,
    radiusMin: 52,
    radiusMax: 108,
    sizeMin: 2.2,
    sizeMax: 3.4,
    brightnessMin: 0.62,
    brightnessMax: 1,
    bandStrength: 0.2,
    seed: 4821,
  },
]

function buildLayer(layer: StarLayer) {
  const rand = mulberry32(layer.seed)
  const positions = new Float32Array(layer.count * 3)
  const colors = new Float32Array(layer.count * 3)
  const sizes = new Float32Array(layer.count)

  for (let i = 0; i < layer.count; i += 1) {
    const direction = bandBiasedDirection(rand, layer.bandStrength * rand())
    const radius = THREE.MathUtils.lerp(layer.radiusMin, layer.radiusMax, rand() ** 0.65)
    positions[i * 3] = direction.x * radius
    positions[i * 3 + 1] = direction.y * radius
    positions[i * 3 + 2] = direction.z * radius

    const brightness = THREE.MathUtils.lerp(
      layer.brightnessMin,
      layer.brightnessMax,
      rand() ** 2.1,
    )
    starColor(rand, brightness, colors, i * 3)
    sizes[i] = THREE.MathUtils.lerp(layer.sizeMin, layer.sizeMax, rand() ** 1.8)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geometry.computeBoundingSphere()
  return geometry
}

function buildClusters() {
  const rand = mulberry32(91573)
  const clusterCount = 5
  const perCluster = 62
  const count = clusterCount * perCluster
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)

  let index = 0
  for (let cluster = 0; cluster < clusterCount; cluster += 1) {
    const center = bandBiasedDirection(rand, 0.7)
    const radius = THREE.MathUtils.lerp(88, 126, rand())
    for (let i = 0; i < perCluster; i += 1) {
      const spread = 0.035 + rand() * 0.075
      const offset = randomDirection(rand).multiplyScalar(spread * Math.sqrt(rand()))
      const direction = center.clone().add(offset).normalize()
      positions[index * 3] = direction.x * radius
      positions[index * 3 + 1] = direction.y * radius
      positions[index * 3 + 2] = direction.z * radius

      starColor(rand, THREE.MathUtils.lerp(0.3, 0.62, rand() ** 1.6), colors, index * 3)
      sizes[index] = THREE.MathUtils.lerp(1.1, 1.9, rand())
      index += 1
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geometry.computeBoundingSphere()
  return geometry
}

const starVertexShader = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uPixelRatio;
  varying vec3 vColor;

  void main() {
    vColor = aColor;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = aSize * uPixelRatio * clamp(130.0 / -viewPosition.z, 0.85, 1.3);
  }
`

const starFragmentShader = /* glsl */ `
  varying vec3 vColor;

  void main() {
    vec2 offset = gl_PointCoord - 0.5;
    float distanceToCenter = length(offset);
    if (distanceToCenter > 0.5) discard;
    float alpha = smoothstep(0.5, 0.06, distanceToCenter);
    alpha *= alpha;
    gl_FragColor = vec4(vColor, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

const skyVertexShader = /* glsl */ `
  varying vec3 vDirection;

  void main() {
    vDirection = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const skyFragmentShader = /* glsl */ `
  uniform vec3 uBandNormal;
  uniform vec3 uCoreDirection;
  varying vec3 vDirection;

  float hash(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
  }

  float valueNoise(vec3 p) {
    vec3 cell = floor(p);
    vec3 local = fract(p);
    local = local * local * (3.0 - 2.0 * local);

    float n000 = hash(cell);
    float n100 = hash(cell + vec3(1.0, 0.0, 0.0));
    float n010 = hash(cell + vec3(0.0, 1.0, 0.0));
    float n110 = hash(cell + vec3(1.0, 1.0, 0.0));
    float n001 = hash(cell + vec3(0.0, 0.0, 1.0));
    float n101 = hash(cell + vec3(1.0, 0.0, 1.0));
    float n011 = hash(cell + vec3(0.0, 1.0, 1.0));
    float n111 = hash(cell + vec3(1.0, 1.0, 1.0));

    float x00 = mix(n000, n100, local.x);
    float x10 = mix(n010, n110, local.x);
    float x01 = mix(n001, n101, local.x);
    float x11 = mix(n011, n111, local.x);

    return mix(mix(x00, x10, local.y), mix(x01, x11, local.y), local.z);
  }

  float fbm(vec3 p) {
    float amplitude = 0.5;
    float sum = 0.0;
    for (int i = 0; i < 3; i += 1) {
      sum += amplitude * valueNoise(p);
      p *= 2.07;
      amplitude *= 0.5;
    }
    return sum;
  }

  void main() {
    vec3 direction = normalize(vDirection);
    float distanceToPlane = abs(dot(direction, uBandNormal));

    // Soft-edged galactic band with irregular, clustered structure.
    float bandMask = smoothstep(0.36, 0.01, distanceToPlane);
    float structure = fbm(direction * 4.0 + 17.0);
    float detail = fbm(direction * 13.0 - 5.0);

    // Dust lanes and brighter clumps break the band into irregular filaments.
    float dustLane = smoothstep(0.46, 0.8, detail);
    float clumps = smoothstep(0.42, 0.72, structure);
    float band = bandMask
      * (0.18 + 0.82 * structure)
      * (0.72 + 0.5 * clumps)
      * (1.0 - 0.6 * dustLane * bandMask);

    float coreGlow = pow(max(0.0, dot(direction, uCoreDirection)), 6.0) * bandMask;

    float intensity = band * 0.26 + coreGlow * 0.06;
    vec3 bandColor = mix(vec3(0.57, 0.565, 0.545), vec3(0.52, 0.55, 0.6), structure * 0.5);
    vec3 color = bandColor * intensity + vec3(0.0055);

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

export default function CosmicEnvironment() {
  const pixelRatio = useThree(
    (state) => Math.min(state.gl.getPixelRatio() || 1, 1.5),
  )

  const starGeometry = useMemo(
    () => [...STAR_LAYERS.map(buildLayer), buildClusters()],
    [],
  )

  const starMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: starVertexShader,
        fragmentShader: starFragmentShader,
        uniforms: { uPixelRatio: { value: pixelRatio } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [pixelRatio],
  )

  const skyGeometry = useMemo(() => new THREE.SphereGeometry(150, 48, 32), [])

  const skyMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: skyVertexShader,
        fragmentShader: skyFragmentShader,
        uniforms: {
          uBandNormal: { value: GALACTIC_NORMAL.clone() },
          uCoreDirection: { value: GALACTIC_CORE.clone() },
        },
        side: THREE.BackSide,
        depthTest: false,
        depthWrite: false,
        toneMapped: true,
      }),
    [],
  )

  useEffect(() => {
    return () => {
      starGeometry.forEach((geometry) => geometry.dispose())
      starMaterial.dispose()
      skyGeometry.dispose()
      skyMaterial.dispose()
    }
  }, [starGeometry, starMaterial, skyGeometry, skyMaterial])

  return (
    <group>
      <mesh geometry={skyGeometry} material={skyMaterial} renderOrder={-2} frustumCulled={false} />
      {starGeometry.map((geometry, index) => (
        <points
          key={index}
          geometry={geometry}
          material={starMaterial}
          frustumCulled={false}
          renderOrder={-1}
        />
      ))}
    </group>
  )
}

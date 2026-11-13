import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import { RotateCcw } from 'lucide-react'

type TerrainMode = 'natural' | 'elevation' | 'slope'

interface Crater {
  x: number
  z: number
  radius: number
  depth: number
}

const modeLabels: { id: TerrainMode; label: string; legend: string }[] = [
  { id: 'natural', label: 'Natural', legend: 'Illustrative surface shading' },
  { id: 'elevation', label: 'Elevation', legend: 'Low terrain → high terrain' },
  { id: 'slope', label: 'Slope', legend: 'Gentle → steep terrain' },
]

function makeCraters(seed: number): Crater[] {
  let state = seed
  const random = () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }

  return Array.from({ length: 12 }, () => ({
    x: (random() - 0.5) * 3.6,
    z: (random() - 0.5) * 3.6,
    radius: 0.18 + random() * 0.5,
    depth: 0.08 + random() * 0.26,
  }))
}

function terrainHeight(x: number, z: number, craters: Crater[], seed: number): number {
  let height = 0.08 * Math.sin(x * 1.8 + seed) * Math.cos(z * 1.55 - seed)
  height += 0.025 * Math.sin(x * 6.3 - z * 4.8)

  for (const crater of craters) {
    const distance = Math.hypot(x - crater.x, z - crater.z)
    if (distance >= crater.radius) continue

    const normalized = distance / crater.radius
    height -= crater.depth * (1 - normalized * normalized)
    height += crater.depth * 0.45 * Math.exp(-(((normalized - 0.88) / 0.09) ** 2))
  }

  return height
}

function mixColor(from: string, to: string, amount: number): THREE.Color {
  return new THREE.Color(from).lerp(new THREE.Color(to), THREE.MathUtils.clamp(amount, 0, 1))
}

function terrainColor(mode: TerrainMode, height: number, normalizedHeight: number, slope: number): THREE.Color {
  if (mode === 'elevation') {
    return normalizedHeight < 0.5
      ? mixColor('#0B1D33', '#45E0D0', normalizedHeight * 2)
      : mixColor('#45E0D0', '#F4F1DE', (normalizedHeight - 0.5) * 2)
  }

  if (mode === 'slope') {
    if (slope < 0.45) return mixColor('#0F766E', '#45E0D0', slope / 0.45)
    if (slope < 0.75) return mixColor('#45E0D0', '#F59E0B', (slope - 0.45) / 0.3)
    return mixColor('#F59E0B', '#FB7185', (slope - 0.75) / 0.25)
  }

  const shade = 0.58 + normalizedHeight * 0.22 - slope * 0.08 + height * 0.1
  return new THREE.Color(shade * 0.95, shade * 0.92, shade * 0.86)
}

function TerrainMesh({ siteId, mode }: { siteId: string; mode: TerrainMode }) {
  const geometry = useMemo(() => {
    const plane = new THREE.PlaneGeometry(4, 4, 112, 112)
    plane.rotateX(-Math.PI / 2)
    return plane
  }, [])

  useEffect(() => () => geometry.dispose(), [geometry])

  useEffect(() => {
    const craters = makeCraters(siteId === 'malapert-massif' ? 23 : 11)
    const seed = siteId === 'malapert-massif' ? 2.4 : 0.8
    const position = geometry.attributes.position
    const heights = new Float32Array(position.count)
    const epsilon = 0.015
    let lowest = Infinity
    let highest = -Infinity

    for (let index = 0; index < position.count; index += 1) {
      const x = position.getX(index)
      const z = position.getZ(index)
      const height = terrainHeight(x, z, craters, seed)
      heights[index] = height
      position.setY(index, height)
      lowest = Math.min(lowest, height)
      highest = Math.max(highest, height)
    }

    const colors = new Float32Array(position.count * 3)
    const range = Math.max(highest - lowest, 0.001)

    for (let index = 0; index < position.count; index += 1) {
      const x = position.getX(index)
      const z = position.getZ(index)
      const height = heights[index]
      const normalizedHeight = (height - lowest) / range
      const slopeX =
        terrainHeight(x + epsilon, z, craters, seed) - terrainHeight(x - epsilon, z, craters, seed)
      const slopeZ =
        terrainHeight(x, z + epsilon, craters, seed) - terrainHeight(x, z - epsilon, craters, seed)
      const slope = THREE.MathUtils.clamp(Math.hypot(slopeX, slopeZ) / (epsilon * 2), 0, 1.3)
      const color = terrainColor(mode, height, normalizedHeight, slope)

      colors[index * 3] = color.r
      colors[index * 3 + 1] = color.g
      colors[index * 3 + 2] = color.b
    }

    position.needsUpdate = true
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.computeVertexNormals()
  }, [geometry, mode, siteId])

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial vertexColors roughness={0.96} metalness={0} />
    </mesh>
  )
}

export default function TerrainViewer({ siteId, siteName }: { siteId: string; siteName: string }) {
  const [mode, setMode] = useState<TerrainMode>('natural')
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const activeMode = modeLabels.find((item) => item.id === mode) ?? modeLabels[0]

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-panel">
      <div style={{ height: 'clamp(380px, 46vw, 520px)' }} className="w-full">
        <Canvas
          camera={{ position: [4.6, 4.0, 5.4], fov: 38, near: 0.1, far: 50 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <color attach="background" args={['#070B14']} />
          <ambientLight intensity={0.42} />
          <directionalLight position={[4, 6, 3]} intensity={2.2} />
          <TerrainMesh siteId={siteId} mode={mode} />
          <OrbitControls
            ref={controlsRef}
            makeDefault
            enableDamping
            dampingFactor={0.08}
            enablePan={false}
            minDistance={4}
            maxDistance={11}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>

      <div className="pointer-events-none absolute inset-x-3 top-3 flex flex-wrap items-start justify-between gap-2">
        <div className="pointer-events-auto flex flex-wrap gap-1 rounded-xl border border-border bg-space/85 p-1 backdrop-blur">
          {modeLabels.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                mode === item.id
                  ? 'bg-accent text-space'
                  : 'text-muted hover:bg-card hover:text-text'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => controlsRef.current?.reset()}
          aria-label="Reset terrain camera"
          title="Reset terrain camera"
          className="pointer-events-auto rounded-lg border border-border bg-space/80 p-2 text-muted backdrop-blur transition hover:border-accent/50 hover:text-accent"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex flex-wrap items-end justify-between gap-2">
        <div className="rounded-md border border-border bg-space/80 px-3 py-1.5 text-xs text-muted backdrop-blur">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-accent2" />
          {siteName} · {activeMode.label} view · {activeMode.legend}
        </div>
        <div className="rounded-md border border-dashed border-amber-400/40 bg-space/80 px-2.5 py-1.5 text-[10px] text-amber-200/80 backdrop-blur">
          Illustrative terrain — not a DEM or NASA measurement
        </div>
      </div>
    </div>
  )
}
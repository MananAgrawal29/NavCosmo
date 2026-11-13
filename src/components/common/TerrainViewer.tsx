import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import { RotateCcw } from 'lucide-react'
import {
  getTerrainParameters,
  terrainHeight,
  type TerrainMode,
} from '../../utils/terrainModel'

const modeLabels: { id: TerrainMode; label: string; legend: string }[] = [
  { id: 'natural', label: 'Natural', legend: 'Illustrative surface shading' },
  { id: 'elevation', label: 'Elevation', legend: 'Low terrain → high terrain' },
  { id: 'slope', label: 'Slope', legend: 'Gentle → steep terrain' },
]

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

function TerrainMesh({
  siteId,
  mode,
  shadows,
}: {
  siteId: string
  mode: TerrainMode
  shadows: boolean
}) {
  const geometry = useMemo(() => {
    const plane = new THREE.PlaneGeometry(4, 4, 112, 112)
    plane.rotateX(-Math.PI / 2)
    return plane
  }, [])

  useEffect(() => () => geometry.dispose(), [geometry])

  useEffect(() => {
    const parameters = getTerrainParameters(siteId)
    const position = geometry.attributes.position
    const heights = new Float32Array(position.count)
    const epsilon = 0.015
    let lowest = Infinity
    let highest = -Infinity

    for (let index = 0; index < position.count; index += 1) {
      const x = position.getX(index)
      const z = position.getZ(index)
      const height = terrainHeight(x, z, parameters)
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
        terrainHeight(x + epsilon, z, parameters) -
        terrainHeight(x - epsilon, z, parameters)
      const slopeZ =
        terrainHeight(x, z + epsilon, parameters) -
        terrainHeight(x, z - epsilon, parameters)
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
    <mesh geometry={geometry} castShadow={shadows} receiveShadow={shadows}>
      <meshStandardMaterial vertexColors roughness={0.96} metalness={0} />
    </mesh>
  )
}

function SunIndicator({ direction }: { direction: [number, number, number] }) {
  const position = useMemo(
    () => new THREE.Vector3(...direction).normalize().multiplyScalar(5.2),
    [direction],
  )

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color="#FFE7A3" />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#FDE68A" transparent opacity={0.16} depthWrite={false} />
      </mesh>
    </group>
  )
}

function ShadowUpdater({
  enabled,
  sunDirection,
}: {
  enabled: boolean
  sunDirection?: [number, number, number]
}) {
  const { gl } = useThree()

  useEffect(() => {
    if (!enabled) return
    gl.shadowMap.autoUpdate = false
    gl.shadowMap.needsUpdate = true
    return () => {
      gl.shadowMap.autoUpdate = true
    }
  }, [enabled, gl, sunDirection])

  return null
}

interface TerrainViewerProps {
  siteId: string
  siteName: string
  sunDirection?: [number, number, number]
  sunIntensity?: number
  ambientIntensity?: number
  shadows?: boolean
}

export default function TerrainViewer({
  siteId,
  siteName,
  sunDirection,
  sunIntensity = 2.2,
  ambientIntensity = 0.42,
  shadows = false,
}: TerrainViewerProps) {
  const [mode, setMode] = useState<TerrainMode>('natural')
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const activeMode = modeLabels.find((item) => item.id === mode) ?? modeLabels[0]
  const lightPosition: [number, number, number] = sunDirection
    ? [sunDirection[0] * 8, sunDirection[1] * 8, sunDirection[2] * 8]
    : [4, 6, 3]
  const sunElevation = sunDirection
    ? THREE.MathUtils.radToDeg(Math.asin(THREE.MathUtils.clamp(sunDirection[1], -1, 1)))
    : null
  const sunAzimuth = sunDirection
    ? (THREE.MathUtils.radToDeg(Math.atan2(sunDirection[2], sunDirection[0])) + 360) % 360
    : null

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-panel">
      <div style={{ height: 'clamp(380px, 46vw, 520px)' }} className="w-full">
        <Canvas
          camera={{ position: [4.6, 4.0, 5.4], fov: 38, near: 0.1, far: 50 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <color attach="background" args={['#070B14']} />
          <ambientLight intensity={ambientIntensity} />
          <directionalLight
            position={lightPosition}
            intensity={sunIntensity}
            castShadow={shadows}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-left={-3.2}
            shadow-camera-right={3.2}
            shadow-camera-top={3.2}
            shadow-camera-bottom={-3.2}
            shadow-camera-near={1}
            shadow-camera-far={20}
            shadow-bias={-0.0004}
          />
          <TerrainMesh siteId={siteId} mode={mode} shadows={shadows} />
          {sunDirection ? <SunIndicator direction={sunDirection} /> : null}
          <ShadowUpdater enabled={shadows} sunDirection={sunDirection} />
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

      {sunDirection && sunElevation !== null && sunAzimuth !== null ? (
        <div className="pointer-events-none absolute left-3 top-[64px] flex items-center gap-2 rounded-lg border border-amber-300/30 bg-space/80 px-2.5 py-1.5 text-[10px] text-amber-100/90 backdrop-blur">
          <span className="relative block h-5 w-5 rounded-full border border-amber-300/40">
            <span
              className="absolute left-1/2 top-1/2 h-px w-2 origin-left bg-amber-200"
              style={{ transform: `rotate(${sunAzimuth}deg)` }}
            />
            <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200" />
          </span>
          <span>Sun</span>
          <span className="font-mono">
            {sunAzimuth.toFixed(0)}° AZ · {sunElevation >= 0 ? '+' : ''}
            {sunElevation.toFixed(1)}° EL
          </span>
        </div>
      ) : null}

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
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
    plane.setAttribute(
      'color',
      new THREE.BufferAttribute(new Float32Array(plane.attributes.position.count * 3), 3),
    )
    return plane
  }, [])
  const heights = useMemo(
    () => new Float32Array(geometry.attributes.position.count),
    [geometry],
  )

  useEffect(() => () => geometry.dispose(), [geometry])

  useEffect(() => {
    const parameters = getTerrainParameters(siteId)
    const position = geometry.attributes.position
    const colorAttribute = geometry.getAttribute('color') as THREE.BufferAttribute
    const colors = colorAttribute.array as Float32Array
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
    colorAttribute.needsUpdate = true
    geometry.computeVertexNormals()
  }, [geometry, heights, mode, siteId])

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

function ViewportSync() {
  const { gl, camera, invalidate } = useThree()

  useEffect(() => {
    const sync = () => {
      const parent = gl.domElement.parentElement
      if (!parent) return
      const width = parent.clientWidth
      const height = parent.clientHeight
      if (!width || !height) return
      gl.setSize(width, height, false)
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = width / height
        camera.updateProjectionMatrix()
      }
      invalidate()
    }

    const timers = [50, 250, 800].map((delay) => window.setTimeout(sync, delay))
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [gl, camera, invalidate])

  return null
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
  mode?: TerrainMode
  onModeChange?: (mode: TerrainMode) => void
  height?: string
  className?: string
  hudInsetLeft?: number
  hudInsetRight?: number
}

export default function TerrainViewer({
  siteId,
  siteName,
  sunDirection,
  sunIntensity = 2.2,
  ambientIntensity = 0.42,
  shadows = false,
  mode: controlledMode,
  onModeChange,
  height = 'clamp(380px, 46vw, 520px)',
  className = '',
  hudInsetLeft = 12,
  hudInsetRight = 12,
}: TerrainViewerProps) {
  const [internalMode, setInternalMode] = useState<TerrainMode>('natural')
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const mode = controlledMode ?? internalMode
  const activeMode = modeLabels.find((item) => item.id === mode) ?? modeLabels[0]
  const changeMode = (nextMode: TerrainMode) => {
    onModeChange?.(nextMode)
    if (controlledMode === undefined) setInternalMode(nextMode)
  }
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
    <div className={`relative overflow-hidden rounded-[2px] border border-border bg-panel ${className}`}>
      <div style={{ height }} className="w-full">
        <Canvas
          camera={{ position: [4.6, 4.0, 5.4], fov: 38, near: 0.1, far: 50 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <color attach="background" args={['#08090B']} />
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
          <ViewportSync />
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

      <div
        className="pointer-events-none absolute top-3 flex flex-wrap items-start justify-between gap-2"
        style={{ left: hudInsetLeft, right: hudInsetRight }}
      >
        <div className="flex flex-col items-start gap-2">
          <div className="pointer-events-auto flex flex-wrap gap-1 rounded-[2px] border border-border bg-panel p-1">
            {modeLabels.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => changeMode(item.id)}
                aria-pressed={mode === item.id}
                className={`inline-flex min-h-11 items-center rounded-[2px] px-3 py-2 text-xs font-medium transition ${
                  mode === item.id
                    ? 'bg-accent text-on-accent'
                    : 'text-muted hover:text-text'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {sunDirection && sunElevation !== null && sunAzimuth !== null ? (
            <div className="flex items-center gap-2 rounded-[2px] border border-solar/40 bg-space px-2.5 py-2 text-xs text-solar">
              <span className="relative block h-5 w-5 rounded-full border border-solar/50">
                <span
                  className="absolute left-1/2 top-1/2 h-px w-2 origin-left bg-solar"
                  style={{ transform: `rotate(${sunAzimuth}deg)` }}
                />
                <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-solar" />
              </span>
              <span>Sun</span>
              <span className="tabular-nums">
                {sunAzimuth.toFixed(0)}° AZ · {sunElevation >= 0 ? '+' : ''}
                {sunElevation.toFixed(1)}° EL
              </span>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => controlsRef.current?.reset()}
          aria-label="Reset terrain camera"
          title="Reset terrain camera"
          className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-panel text-muted transition hover:border-border-strong hover:bg-hover hover:text-text"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <div
        className="pointer-events-none absolute bottom-14 flex flex-wrap items-end justify-between gap-2 md:bottom-3"
        style={{ left: hudInsetLeft, right: hudInsetRight }}
      >
        <div className="rounded-[2px] border border-border bg-panel px-3 py-2 text-xs text-muted">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-faint" />
          {siteName} · {activeMode.label} view · {activeMode.legend}
        </div>
        <div className="rounded-[2px] border-l-2 border-warning bg-panel px-2.5 py-2 text-xs text-warning">
          Illustrative terrain — not a DEM or NASA measurement
        </div>
      </div>
    </div>
  )
}
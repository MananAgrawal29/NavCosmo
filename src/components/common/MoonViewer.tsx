import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, OrbitControls, Stars, useTexture } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import { Minus, Plus, RotateCcw } from 'lucide-react'
import { lunarSites } from '../../data/lunarSites'
import type { LunarSite } from '../../types/lunarSite'
import { latLonToVector3 } from '../../utils/lunarCoordinates'

const MOON_RADIUS = 1.6
const FOCUS_DISTANCE = 3.0
const MIN_DISTANCE = 2.25
const MAX_DISTANCE = 8.5
const INITIAL_CAMERA = new THREE.Vector3(0, -3.4, 4.4)

const UP = new THREE.Vector3(0, 1, 0)

function MoonSurface({ moonRef }: { moonRef: RefObject<THREE.Mesh | null> }) {
  const [colorMap, reliefMap] = useTexture([
    '/textures/moon-color-2k.jpg',
    '/textures/moon-relief-1k.jpg',
  ])

  useEffect(() => {
    colorMap.colorSpace = THREE.SRGBColorSpace
    colorMap.anisotropy = 4
    colorMap.needsUpdate = true
    reliefMap.anisotropy = 2
  }, [colorMap, reliefMap])

  return (
    <mesh ref={moonRef}>
      <sphereGeometry args={[MOON_RADIUS, 96, 64]} />
      <meshStandardMaterial
        map={colorMap}
        bumpMap={reliefMap}
        bumpScale={0.018}
        roughness={0.94}
        metalness={0}
      />
    </mesh>
  )
}

interface SiteMarkerProps {
  site: LunarSite
  position: THREE.Vector3
  selected: boolean
  onSelect: (site: LunarSite) => void
  moonRef: RefObject<THREE.Mesh | null>
}

function SiteMarker({ site, position, selected, onSelect, moonRef }: SiteMarkerProps) {
  const ringRef = useRef<THREE.Mesh>(null)
  const dotRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const quaternion = useMemo(() => {
    const normal = position.clone().normalize()
    return new THREE.Quaternion().setFromUnitVectors(UP, normal)
  }, [position])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const pulse = 1 + Math.sin(t * 2.1 + site.latitude * 0.15) * (selected ? 0.16 : 0.09)

    if (ringRef.current) {
      ringRef.current.scale.setScalar(pulse)
      const material = ringRef.current.material as THREE.MeshBasicMaterial
      material.opacity = selected ? 0.9 : 0.45
    }

    if (dotRef.current) {
      const scale = selected ? 1.35 : hovered ? 1.15 : 1
      dotRef.current.scale.setScalar(scale)
    }
  })

  const markerColor = selected ? '#66B8FF' : '#45E0D0'

  return (
    <group position={position} quaternion={quaternion}>
      <mesh
        ref={dotRef}
        onClick={(event) => {
          event.stopPropagation()
          onSelect(site)
        }}
        onPointerDown={(event) => event.stopPropagation()}
        onPointerOver={(event) => {
          event.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
      >
        <sphereGeometry args={[0.022, 16, 16]} />
        <meshBasicMaterial color={markerColor} />
      </mesh>

      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <ringGeometry args={[0.038, 0.05, 32]} />
        <meshBasicMaterial
          color={markerColor}
          transparent
          opacity={0.45}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.0025, 0.0025, 0.18, 6]} />
        <meshBasicMaterial color={markerColor} transparent opacity={0.7} />
      </mesh>

      <mesh position={[0, 0.19, 0]}>
        <sphereGeometry args={[0.012, 12, 12]} />
        <meshBasicMaterial color={markerColor} />
      </mesh>

      <Html
        position={[0, 0, 0]}
        center
        occlude={[moonRef as unknown as RefObject<THREE.Object3D>]}
        zIndexRange={[8, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div
          className={`-translate-y-20 md:-translate-y-12 ${
            site.id === 'shackleton-crater'
              ? '-translate-x-16 md:-translate-x-28'
              : 'translate-x-16 md:translate-x-28'
          }`}
        >
          <button
            type="button"
            onClick={() => onSelect(site)}
            onPointerDown={(event) => event.stopPropagation()}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border font-semibold shadow-lg backdrop-blur transition ${
              selected
                ? 'border-accent bg-accent text-space'
                : 'border-accent2/50 bg-space/90 text-text hover:border-accent hover:text-accent'
            }`}
            style={{ pointerEvents: 'auto', fontSize: 10, lineHeight: 1.4, padding: '4px 8px' }}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                selected ? 'bg-space' : 'bg-accent2'
              }`}
            />
            {site.name}
          </button>
        </div>
      </Html>
    </group>
  )
}

interface MoonMarkersProps {
  selectedSiteId?: string | null
  onSelect: (site: LunarSite) => void
  moonRef: RefObject<THREE.Mesh | null>
}

function MoonMarkers({ selectedSiteId, onSelect, moonRef }: MoonMarkersProps) {
  const markers = useMemo(
    () =>
      lunarSites.map((site) => ({
        site,
        position: latLonToVector3(site.latitude, site.longitude, MOON_RADIUS + 0.004),
      })),
    [],
  )

  return (
    <group>
      {markers.map(({ site, position }) => (
        <SiteMarker
          key={site.id}
          site={site}
          position={position}
          selected={site.id === selectedSiteId}
          onSelect={onSelect}
          moonRef={moonRef}
        />
      ))}
    </group>
  )
}

interface CameraRigProps {
  controlsRef: RefObject<OrbitControlsImpl | null>
  target: THREE.Vector3 | null
  zoomRequest: { id: number; direction: 1 | -1 } | null
}

function CameraRig({ controlsRef, target, zoomRequest }: CameraRigProps) {
  const { camera } = useThree()
  const moveTarget = useRef(new THREE.Vector3())
  const animating = useRef(false)

  useEffect(() => {
    if (!target) return
    moveTarget.current.copy(target)
    animating.current = true
  }, [target])

  useEffect(() => {
    if (!zoomRequest) return

    const direction = camera.position.clone().normalize()
    const nextDistance = THREE.MathUtils.clamp(
      camera.position.length() * (zoomRequest.direction > 0 ? 0.82 : 1.22),
      MIN_DISTANCE,
      MAX_DISTANCE,
    )
    moveTarget.current.copy(direction.multiplyScalar(nextDistance))
    animating.current = true
  }, [camera, zoomRequest])

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return

    const stopAnimation = () => {
      animating.current = false
    }
    controls.addEventListener('start', stopAnimation)
    return () => controls.removeEventListener('start', stopAnimation)
  }, [controlsRef])

  useFrame(() => {
    if (!animating.current) return

    camera.position.lerp(moveTarget.current, 0.1)
    if (camera.position.distanceTo(moveTarget.current) < 0.012) {
      camera.position.copy(moveTarget.current)
      animating.current = false
    }
    controlsRef.current?.update()
  })

  return null
}

interface MoonViewerProps {
  height?: string
  caption?: string
  selectedSiteId?: string | null
  onSiteSelect?: (siteId: string) => void
  resetSignal?: number
  className?: string
}

export default function MoonViewer({
  height = '420px',
  caption,
  selectedSiteId,
  onSiteSelect,
  resetSignal,
  className = '',
}: MoonViewerProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const moonRef = useRef<THREE.Mesh | null>(null)
  const previousSelected = useRef<string | null | undefined>(selectedSiteId)
  const [cameraTarget, setCameraTarget] = useState<THREE.Vector3 | null>(null)
  const [zoomRequest, setZoomRequest] = useState<{ id: number; direction: 1 | -1 } | null>(null)

  useEffect(
    () => () => {
      document.body.style.cursor = 'auto'
    },
    [],
  )

  const focusSite = useCallback((site: LunarSite) => {
    const normal = latLonToVector3(site.latitude, site.longitude, 1).normalize()
    setCameraTarget(normal.multiplyScalar(FOCUS_DISTANCE))
  }, [])

  useEffect(() => {
    if (!selectedSiteId || selectedSiteId === previousSelected.current) return
    previousSelected.current = selectedSiteId

    const site = lunarSites.find((candidate) => candidate.id === selectedSiteId)
    if (site) focusSite(site)
  }, [focusSite, selectedSiteId])

  useEffect(() => {
    if (resetSignal === undefined || resetSignal === 0) return
    setCameraTarget(INITIAL_CAMERA.clone())
  }, [resetSignal])

  const handleMarkerSelect = (site: LunarSite) => {
    previousSelected.current = site.id
    focusSite(site)
    onSiteSelect?.(site.id)
  }

  const handleReset = () => {
    setCameraTarget(INITIAL_CAMERA.clone())
  }

  const handleZoom = (direction: 1 | -1) => {
    setZoomRequest((previous) => ({
      id: (previous?.id ?? 0) + 1,
      direction,
    }))
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border bg-panel ${className}`}>
      <div style={{ height }} className="w-full">
        <Canvas
          camera={{ position: INITIAL_CAMERA.toArray(), fov: 40, near: 0.1, far: 200 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <color attach="background" args={['#070B14']} />
          <ambientLight intensity={0.28} />
          <directionalLight position={[5, 2.5, 4]} intensity={2.2} />
          <Suspense fallback={null}>
            <MoonSurface moonRef={moonRef} />
            <MoonMarkers
              selectedSiteId={selectedSiteId}
              onSelect={handleMarkerSelect}
              moonRef={moonRef}
            />
            <Stars radius={80} depth={30} count={1800} factor={2} saturation={0} fade speed={0.25} />
          </Suspense>
          <OrbitControls
            ref={controlsRef}
            makeDefault
            enableDamping
            dampingFactor={0.075}
            enablePan={false}
            minDistance={MIN_DISTANCE}
            maxDistance={MAX_DISTANCE}
            rotateSpeed={0.55}
            zoomSpeed={0.8}
          />
          <CameraRig controlsRef={controlsRef} target={cameraTarget} zoomRequest={zoomRequest} />
        </Canvas>
      </div>

      <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-3">
        <div className="pointer-events-auto rounded-full border border-border bg-space/70 px-3 py-1.5 text-xs text-muted backdrop-blur">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-accent2" />
          Interactive lunar globe
        </div>
        <div className="pointer-events-auto flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => handleZoom(1)}
            aria-label="Zoom in"
            title="Zoom in"
            className="rounded-lg border border-border bg-space/75 p-2 text-muted backdrop-blur transition hover:border-accent/50 hover:text-accent"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(-1)}
            aria-label="Zoom out"
            title="Zoom out"
            className="rounded-lg border border-border bg-space/75 p-2 text-muted backdrop-blur transition hover:border-accent/50 hover:text-accent"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset to global view"
            title="Reset to global view"
            className="rounded-lg border border-border bg-space/75 p-2 text-muted backdrop-blur transition hover:border-accent/50 hover:text-accent"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex flex-wrap items-end justify-between gap-2">
        <div className="rounded-md border border-border bg-space/75 px-3 py-1.5 text-xs text-muted backdrop-blur">
          {caption ?? 'Drag to rotate · Scroll to zoom · Select a marker to inspect'}
        </div>
        <a
          href="https://svs.gsfc.nasa.gov/4720/"
          target="_blank"
          rel="noreferrer"
          className="pointer-events-auto rounded-md border border-border bg-space/75 px-2.5 py-1.5 text-xs text-muted backdrop-blur transition hover:text-text"
        >
          Texture: NASA SVS CGI Moon Kit · LROC/LOLA
        </a>
      </div>
    </div>
  )
}
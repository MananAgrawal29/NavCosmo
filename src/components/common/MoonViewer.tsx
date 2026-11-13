import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { Suspense } from 'react'

function MoonMesh() {
  return (
    <mesh>
      <sphereGeometry args={[1.6, 64, 64]} />
      <meshStandardMaterial color="#C9D4E8" roughness={0.9} metalness={0.05} />
    </mesh>
  )
}

interface MoonViewerProps {
  height?: string
  caption?: string
}

export default function MoonViewer({ height = '420px', caption }: MoonViewerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-panel">
      <div style={{ height }} className="w-full">
        <Canvas camera={{ position: [0, 0, 5.2], fov: 42 }}>
          <color attach="background" args={['#070B14']} />
          <ambientLight intensity={0.35} />
          <directionalLight position={[4, 2, 3]} intensity={1.1} />
          <Suspense fallback={null}>
            <MoonMesh />
            <Stars radius={40} depth={20} count={1200} factor={2} saturation={0} fade />
          </Suspense>
          <OrbitControls enablePan={false} minDistance={3.2} maxDistance={8} />
        </Canvas>
      </div>
      <div className="absolute bottom-3 left-3 rounded-md border border-border bg-space/70 px-3 py-1.5 text-xs text-muted backdrop-blur">
        {caption ?? 'Illustrative 3D Moon placeholder — authentic terrain models arrive in P01.'}
      </div>
    </div>
  )
}
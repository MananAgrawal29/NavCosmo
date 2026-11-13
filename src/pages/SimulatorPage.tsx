import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Sun } from 'lucide-react'
import * as THREE from 'three'
import TerrainViewer from '../components/common/TerrainViewer'
import { Card, SectionHeader } from '../components/common/Card'
import SimulationTimeline from '../components/workspace/SimulationTimeline'
import { lunarSites, getSiteById } from '../data/lunarSites'
import { useSunlightSimulation } from '../hooks/useSunlightSimulation'

export default function SimulatorPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selected = getSiteById(searchParams.get('site') ?? '') ?? lunarSites[0]
  const {
    timeFraction,
    setTimeFraction,
    playing,
    setPlaying,
    speed,
    setSpeed,
    simulation,
    resetSimulation,
  } = useSunlightSimulation(selected.id)

  const selectSite = (siteId: string) => {
    setSearchParams({ site: siteId }, { replace: true })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            Lunar illumination lab
          </p>
          <h1 className="mt-2 text-3xl font-bold text-text">Sunlight Simulator</h1>
          <p className="mt-2 max-w-3xl text-muted">
            Move through a simplified lunar solar cycle to observe how the Sun direction, terrain
            illumination, and relative solar availability change at each candidate site.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/analysis?site=${selected.id}`}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-text transition hover:border-accent/50 hover:text-accent"
          >
            Site details
          </Link>
          <Link
            to={`/workspace?site=${selected.id}&mode=global`}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-text transition hover:border-accent/50 hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Mission Workspace
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {lunarSites.map((site) => (
          <button
            key={site.id}
            type="button"
            onClick={() => selectSite(site.id)}
            className={`rounded-xl border px-4 py-2 text-sm transition ${
              site.id === selected.id
                ? 'border-accent bg-accent/15 text-accent'
                : 'border-border bg-card text-muted hover:border-accent/30 hover:text-text'
            }`}
          >
            {site.name}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-4">
          <TerrainViewer
            siteId={selected.id}
            siteName={selected.name}
            sunDirection={simulation.sunDirection}
            sunIntensity={
              simulation.elevationDeg > 0
                ? 0.9 +
                  Math.max(0, Math.sin(THREE.MathUtils.degToRad(simulation.elevationDeg))) * 1.5
                : 0
            }
            ambientIntensity={simulation.elevationDeg > 0 ? 0.2 : 0.13}
            shadows={simulation.elevationDeg > 0}
          />

          <Card>
            <SimulationTimeline
              timeFraction={timeFraction}
              setTimeFraction={setTimeFraction}
              playing={playing}
              setPlaying={setPlaying}
              speed={speed}
              setSpeed={setSpeed}
              resetSimulation={resetSimulation}
              simulation={simulation}
            />
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <SectionHeader title="Illumination readout" subtitle="Illustrative simulation outputs" />
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                <span className="text-muted">Sun elevation</span>
                <span className="font-mono text-text">
                  {simulation.elevationDeg >= 0 ? '+' : ''}
                  {simulation.elevationDeg.toFixed(1)}°
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                <span className="text-muted">Illumination</span>
                <span className="text-right text-text">{simulation.illuminationStatus}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                <span className="text-muted">Illustrative terrain lit</span>
                <span className="font-mono text-text">
                  {(simulation.illuminatedFraction * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                <span className="text-muted">Relative solar availability</span>
                <span className="font-mono text-accent2">
                  {simulation.solarAvailability.toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Shadow condition</span>
                <span className="text-right text-text">{simulation.shadowCondition}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-accent/30 bg-panel p-3 text-xs leading-5 text-muted">
              <Sun className="h-4 w-4 shrink-0 text-amber-200" />
              Relative availability is derived from Sun elevation and the illustrative lit-terrain
              fraction. It is not a power measurement in watts.
            </div>
          </Card>

          <Card>
            <SectionHeader title="Model assumptions" subtitle="Read before interpreting the readout" />
            <ul className="space-y-2 text-xs leading-5 text-muted">
              <li>• Simplified sinusoidal Sun elevation over a 29.53-day lunar solar cycle.</li>
              <li>• Azimuth rotates once per cycle; no lunar ephemeris, libration, or local horizon model.</li>
              <li>• Terrain is procedurally generated and is not a Shackleton or Malapert DEM.</li>
              <li>• Shadows and illumination fractions are illustrative, not predictive observing windows.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
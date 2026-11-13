import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Pause, Play, RotateCcw, Sun } from 'lucide-react'
import * as THREE from 'three'
import TerrainViewer from '../components/common/TerrainViewer'
import { Card, SectionHeader } from '../components/common/Card'
import { lunarSites, getSiteById } from '../data/lunarSites'
import { estimateIlluminatedFraction } from '../utils/terrainModel'

const LUNAR_CYCLE_HOURS = 708.7
const INITIAL_FRACTION = 0.18
const SPEEDS = [0.5, 1, 2] as const

const illustrationElevation: Record<string, number> = {
  'shackleton-crater': 7,
  'malapert-massif': 15,
}

const azimuthOffset: Record<string, number> = {
  'shackleton-crater': 0,
  'malapert-massif': 0.55,
}

export default function SimulatorPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selected = getSiteById(searchParams.get('site') ?? '') ?? lunarSites[0]
  const [timeFraction, setTimeFraction] = useState(INITIAL_FRACTION)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1)

  useEffect(() => {
    if (!playing) return

    const timer = window.setInterval(() => {
      setTimeFraction((previous) => {
        const next = previous + 0.0024 * speed
        return next >= 1 ? 0 : next
      })
    }, 100)

    return () => window.clearInterval(timer)
  }, [playing, speed])

  const simulation = useMemo(() => {
    const phase = timeFraction * Math.PI * 2
    const maxElevation = illustrationElevation[selected.id] ?? 8
    const elevationDeg = maxElevation * Math.sin(phase)
    const elevationRad = THREE.MathUtils.degToRad(elevationDeg)
    const azimuthRad = phase + (azimuthOffset[selected.id] ?? 0)
    const cosElevation = Math.cos(elevationRad)
    const sunDirection: [number, number, number] = [
      cosElevation * Math.cos(azimuthRad),
      Math.sin(elevationRad),
      cosElevation * Math.sin(azimuthRad),
    ]
    const sunVector = new THREE.Vector3(...sunDirection).normalize()
    const illuminatedFraction = estimateIlluminatedFraction(selected.id, sunVector)
    const solarAvailability = Math.max(0, sunDirection[1]) * illuminatedFraction * 100
    const timeHours = timeFraction * LUNAR_CYCLE_HOURS

    return {
      elevationDeg,
      sunDirection,
      illuminatedFraction,
      solarAvailability,
      timeHours,
      illuminationStatus:
        elevationDeg <= 0
          ? 'Sun below horizon'
          : illuminatedFraction >= 0.72
            ? 'Broadly illuminated'
            : illuminatedFraction >= 0.28
              ? 'Partial illumination'
              : 'Mostly shadowed',
      shadowCondition:
        elevationDeg <= 0
          ? 'Night side · no direct sunlight'
          : illuminatedFraction < 0.25
            ? 'Dominant shadow cover'
            : illuminatedFraction < 0.65
              ? 'Mixed light and shadow'
              : 'Limited shadow cover',
    }
  }, [selected.id, timeFraction])

  const selectSite = (siteId: string) => {
    setSearchParams({ site: siteId }, { replace: true })
  }

  const resetSimulation = () => {
    setPlaying(false)
    setTimeFraction(INITIAL_FRACTION)
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
            to={`/explorer?site=${selected.id}`}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-text transition hover:border-accent/50 hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Global Moon
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
            sunIntensity={simulation.elevationDeg > 0 ? 0.9 + Math.max(0, Math.sin(THREE.MathUtils.degToRad(simulation.elevationDeg))) * 1.5 : 0}
            ambientIntensity={simulation.elevationDeg > 0 ? 0.2 : 0.13}
            shadows={simulation.elevationDeg > 0}
          />

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Simulation timeline</p>
                <p className="mt-1 font-mono text-xl text-text">
                  {simulation.timeHours.toFixed(1)} h
                  <span className="ml-2 text-sm text-muted">/ {LUNAR_CYCLE_HOURS} h</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPlaying((value) => !value)}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-space transition hover:bg-accent/90"
                >
                  {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {playing ? 'Pause' : 'Play'}
                </button>
                <button
                  type="button"
                  onClick={resetSimulation}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text transition hover:border-accent/50 hover:text-accent"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>
            </div>

            <div className="mt-4">
              <input
                type="range"
                min={0}
                max={1000}
                step={1}
                value={Math.round(timeFraction * 1000)}
                onChange={(event) => setTimeFraction(Number(event.target.value) / 1000)}
                aria-label="Simulation time"
                className="w-full cursor-pointer"
                style={{ accentColor: '#66B8FF' }}
              />
              <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wide text-muted">
                <span>Sunrise</span>
                <span>Noon</span>
                <span>Sunset</span>
                <span>Midnight</span>
                <span>Sunrise</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-xs text-muted">
              <span>
                Simulated cycle: {LUNAR_CYCLE_HOURS} h · loops at the boundary
              </span>
              <div className="flex items-center gap-1">
                <span className="mr-1">Speed</span>
                {SPEEDS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSpeed(option)}
                    className={`rounded-md border px-2 py-1 transition ${
                      speed === option
                        ? 'border-accent bg-accent/15 text-accent'
                        : 'border-border text-muted hover:text-text'
                    }`}
                  >
                    {option}×
                  </button>
                ))}
              </div>
            </div>
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
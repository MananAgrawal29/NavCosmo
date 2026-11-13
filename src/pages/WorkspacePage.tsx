import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ChevronRight,
  Globe2,
  MapPin,
  Mountain,
  PanelLeft,
  PanelRight,
  Scale,
  Sun,
  X,
} from 'lucide-react'
import * as THREE from 'three'
import MoonViewer from '../components/common/MoonViewer'
import TerrainViewer from '../components/common/TerrainViewer'
import SimulationTimeline from '../components/workspace/SimulationTimeline'
import { lunarSites, getSiteById } from '../data/lunarSites'
import {
  getSiteProfile,
  type SuitabilityStatus,
} from '../data/siteProfiles'
import { useSunlightSimulation } from '../hooks/useSunlightSimulation'
import type { TerrainMode } from '../utils/terrainModel'

type WorkspaceMode = 'global' | 'terrain' | 'sunlight' | 'compare'

const modes: { id: WorkspaceMode; label: string; icon: typeof Globe2 }[] = [
  { id: 'global', label: 'Moon', icon: Globe2 },
  { id: 'terrain', label: 'Terrain', icon: Mountain },
  { id: 'sunlight', label: 'Sunlight', icon: Sun },
  { id: 'compare', label: 'Compare', icon: Scale },
]

const statusStyles: Record<SuitabilityStatus, string> = {
  Promising: 'border-accent2/40 bg-accent2/10 text-accent2',
  Conditional: 'border-amber-400/40 bg-amber-400/10 text-amber-200',
  Challenging: 'border-rose-400/40 bg-rose-400/10 text-rose-200',
  'Requires further data': 'border-accent/40 bg-accent/10 text-accent',
}

function isWorkspaceMode(value: string | null): value is WorkspaceMode {
  return value === 'global' || value === 'terrain' || value === 'sunlight' || value === 'compare'
}

function ComparisonBoard() {
  const [shackleton, malapert] = lunarSites
  const profiles = [getSiteProfile(shackleton.id), getSiteProfile(malapert.id)]
  const rows = [
    ['Scientific value', 'Scientific value'],
    ['Terrain considerations', 'Terrain safety'],
    ['Solar illumination potential', 'Solar illumination'],
    ['Communication considerations', 'Communication potential'],
    ['Resource investigation potential', 'Resource accessibility'],
  ] as const

  return (
    <div className="mx-auto max-w-5xl space-y-4 py-2">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-accent">Comparative analysis</p>
        <h1 className="mt-2 text-2xl font-bold text-text">Shackleton vs. Malapert</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          Side-by-side mission considerations for the two candidate south-pole locations. Entries
          are qualitative and illustrative, not measured comparisons.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {[shackleton, malapert].map((site) => (
          <div key={site.id} className="rounded-2xl border border-border bg-card/90 p-4">
            <h2 className="text-lg font-semibold text-text">{site.name}</h2>
            <p className="mt-1 text-xs text-accent2">{site.region}</p>
            <p className="mt-2 text-xs text-muted">
              {site.latitude.toFixed(1)}°, {site.longitude.toFixed(1)}° · approximate candidate
            </p>
            <p className="mt-3 text-sm leading-5 text-muted">{site.description}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-accent2">Advantages</p>
                <ul className="mt-1 space-y-1 text-xs leading-5 text-muted">
                  {site.advantages.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-rose-300">Limitations</p>
                <ul className="mt-1 space-y-1 text-xs leading-5 text-muted">
                  {site.limitations.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card/90">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted">
              <th className="p-3 font-medium">Consideration</th>
              <th className="p-3 font-medium">Shackleton Crater</th>
              <th className="p-3 font-medium">Malapert Massif</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, category]) => (
              <tr key={label} className="border-b border-border/70 last:border-0">
                <td className="p-3 align-top text-muted">{label}</td>
                {profiles.map((profile, index) => {
                  const indicator = profile.suitability.find((item) => item.category === category)
                  return (
                    <td key={index} className="p-3 align-top">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] ${indicator ? statusStyles[indicator.status] : 'text-muted'}`}>
                        {indicator?.status ?? 'Requires further data'}
                      </span>
                      <p className="mt-1 text-xs leading-5 text-muted">{indicator?.reason}</p>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="rounded-xl border border-dashed border-amber-400/30 bg-card/80 p-3 text-xs leading-5 text-muted">
        Comparison statuses are qualitative planning indicators. They are not numerical scores,
        measured illumination windows, or verified landing assessments.
      </p>
    </div>
  )
}

export default function WorkspacePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedMode = searchParams.get('mode')
  const mode: WorkspaceMode = isWorkspaceMode(requestedMode) ? requestedMode : 'global'
  const selected = getSiteById(searchParams.get('site') ?? '') ?? lunarSites[0]
  const profile = getSiteProfile(selected.id)
  const [terrainMode, setTerrainMode] = useState<TerrainMode>('natural')
  const [leftOpen, setLeftOpen] = useState(() => window.innerWidth >= 1024)
  const [rightOpen, setRightOpen] = useState(() => window.innerWidth >= 1024)
  const [viewportMode, setViewportMode] = useState<WorkspaceMode>(mode)
  const sunlight = useSunlightSimulation(selected.id, mode === 'sunlight')

  useEffect(() => {
    if (viewportMode === mode) return
    const entering3D =
      (viewportMode === 'global' || viewportMode === 'compare') &&
      (mode === 'terrain' || mode === 'sunlight')
    const nextMode = entering3D && mode === 'sunlight' ? 'terrain' : mode
    // Let the previous canvas unmount before mounting another WebGL surface.
    const timer = window.setTimeout(() => setViewportMode(nextMode), entering3D ? 60 : 80)
    return () => window.clearTimeout(timer)
  }, [mode, viewportMode])

  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => next.set(key, value))
    setSearchParams(next, { replace: true })
  }

  const setMode = (nextMode: WorkspaceMode) => {
    updateParams({ mode: nextMode, site: selected.id })
  }

  const setSite = (siteId: string) => {
    updateParams({ site: siteId, mode })
  }

  const toggleLeftPanel = () => {
    const next = !leftOpen
    setLeftOpen(next)
    if (next && window.innerWidth < 1024) setRightOpen(false)
  }

  const toggleRightPanel = () => {
    const next = !rightOpen
    setRightOpen(next)
    if (next && window.innerWidth < 1024) setLeftOpen(false)
  }

  const comparisonPadding = `pt-20 pb-6 ${leftOpen ? 'lg:pl-72' : 'lg:pl-4'} ${
    rightOpen ? 'lg:pr-96' : 'lg:pr-4'
  }`

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden bg-space lg:h-[calc(100vh-4rem)]">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-panel/95 px-3 py-2">
        <button
          type="button"
          onClick={toggleLeftPanel}
          aria-label={leftOpen ? 'Collapse site panel' : 'Open site panel'}
          className="rounded-lg border border-border bg-space/80 p-2 text-muted transition hover:border-accent/50 hover:text-accent"
        >
          {leftOpen ? <X className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </button>

        <div className="flex flex-wrap items-center justify-center gap-1 rounded-xl border border-border bg-space/85 p-1">
          {modes.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                title={item.label}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                  mode === item.id
                    ? 'bg-accent text-space'
                    : 'text-muted hover:bg-card hover:text-text'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={toggleRightPanel}
          aria-label={rightOpen ? 'Collapse inspector' : 'Open inspector'}
          className="rounded-lg border border-border bg-space/80 p-2 text-muted transition hover:border-accent/50 hover:text-accent"
        >
          {rightOpen ? <X className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
        </button>
      </div>

      <div className="relative min-h-[62vh] flex-1 overflow-hidden">
        {viewportMode === 'global' ? (
          <MoonViewer
            height="100%"
            className="h-full rounded-none border-0"
            selectedSiteId={selected.id}
            onSiteSelect={setSite}
            caption="Drag to rotate · Scroll to zoom · Select a marker"
          />
        ) : null}

        {viewportMode === 'terrain' || viewportMode === 'sunlight' ? (
          <TerrainViewer
            siteId={selected.id}
            siteName={selected.name}
            mode={terrainMode}
            onModeChange={setTerrainMode}
            height="100%"
            className="h-full rounded-none border-0"
            sunDirection={mode === 'sunlight' ? sunlight.simulation.sunDirection : undefined}
            sunIntensity={
              mode === 'sunlight'
                ? sunlight.simulation.elevationDeg > 0
                  ? 0.9 +
                    Math.max(0, Math.sin(THREE.MathUtils.degToRad(sunlight.simulation.elevationDeg))) * 1.5
                  : 0
                : undefined
            }
            ambientIntensity={mode === 'sunlight' ? (sunlight.simulation.elevationDeg > 0 ? 0.2 : 0.13) : undefined}
            shadows={mode === 'sunlight' && sunlight.simulation.elevationDeg > 0}
          />
        ) : null}

        {viewportMode === 'compare' ? (
          <div className={`h-full overflow-y-auto bg-space px-4 ${comparisonPadding}`}>
            <ComparisonBoard />
          </div>
        ) : null}

        {leftOpen ? (
          <aside className="absolute left-3 top-16 z-20 max-h-[calc(100%-5rem)] w-64 overflow-y-auto rounded-2xl border border-border bg-panel/95 p-4 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-widest text-muted">Candidate sites</p>
              <button type="button" onClick={() => setLeftOpen(false)} aria-label="Collapse site panel" className="text-muted hover:text-text">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {lunarSites.map((site) => (
                <button
                  key={site.id}
                  type="button"
                  onClick={() => setSite(site.id)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
                    site.id === selected.id
                      ? 'border-accent bg-accent/15'
                      : 'border-border bg-card/70 hover:border-accent/40'
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-text">{site.name}</span>
                    {site.id === selected.id ? <span className="h-1.5 w-1.5 rounded-full bg-accent" /> : null}
                  </span>
                  <span className="mt-1 block text-[10px] text-muted">
                    {site.latitude.toFixed(1)}°, {site.longitude.toFixed(1)}°
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <p className="text-[10px] uppercase tracking-wide text-muted">Current view</p>
              <p className="mt-1 text-sm capitalize text-text">{mode === 'compare' ? 'Site comparison' : mode}</p>
              <p className="mt-3 text-[10px] uppercase tracking-wide text-muted">Terrain display</p>
              {mode === 'terrain' || mode === 'sunlight' ? (
                <div className="mt-1.5 grid grid-cols-3 gap-1">
                  {(['natural', 'elevation', 'slope'] as TerrainMode[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setTerrainMode(option)}
                      className={`rounded-md border px-1.5 py-1 text-[10px] capitalize transition ${
                        terrainMode === option
                          ? 'border-accent bg-accent/15 text-accent'
                          : 'border-border text-muted hover:text-text'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-sm capitalize text-text">{terrainMode}</p>
              )}
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <Link
                to={`/analysis?site=${selected.id}`}
                className="flex items-center justify-between gap-2 text-xs text-muted transition hover:text-accent"
              >
                Full site report
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
              <p className="mt-3 text-[10px] leading-4 text-muted">
                Coordinates are approximate candidate locations, not verified landing sites.
              </p>
            </div>
          </aside>
        ) : null}

        {rightOpen ? (
          <aside
            className="absolute bottom-3 right-3 top-16 z-20 overflow-y-auto rounded-2xl border border-border bg-panel/95 p-4 shadow-2xl backdrop-blur"
            style={{ width: 'min(20rem, calc(100% - 1.5rem))' }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted">Inspector</p>
                <h2 className="mt-1 text-xl font-semibold text-text">{selected.name}</h2>
                <p className="mt-0.5 text-xs text-accent2">{selected.region}</p>
              </div>
              <button type="button" onClick={() => setRightOpen(false)} aria-label="Collapse inspector" className="text-muted hover:text-text">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-space/60 px-2.5 py-2 text-[10px] text-muted">
              <MapPin className="h-3.5 w-3.5 text-accent" />
              <span>{selected.latitude.toFixed(1)}°, {selected.longitude.toFixed(1)}° · approximate candidate</span>
            </div>

            {mode === 'sunlight' ? (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-border bg-card/70 p-2.5">
                  <p className="text-[9px] uppercase tracking-wide text-muted">Sun elevation</p>
                  <p className="mt-0.5 font-mono text-sm text-text">
                    {sunlight.simulation.elevationDeg >= 0 ? '+' : ''}
                    {sunlight.simulation.elevationDeg.toFixed(1)}°
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-card/70 p-2.5">
                  <p className="text-[9px] uppercase tracking-wide text-muted">Terrain lit</p>
                  <p className="mt-0.5 font-mono text-sm text-text">
                    {(sunlight.simulation.illuminatedFraction * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-card/70 p-2.5">
                  <p className="text-[9px] uppercase tracking-wide text-muted">Relative solar</p>
                  <p className="mt-0.5 font-mono text-sm text-accent2">
                    {sunlight.simulation.solarAvailability.toFixed(0)}%
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-card/70 p-2.5">
                  <p className="text-[9px] uppercase tracking-wide text-muted">Illumination</p>
                  <p className="mt-0.5 text-xs text-text">{sunlight.simulation.illuminationStatus}</p>
                </div>
                <div className="col-span-2 rounded-lg border border-dashed border-amber-400/30 bg-card/60 p-2.5 text-[10px] leading-4 text-muted">
                  {sunlight.simulation.shadowCondition}. Illustrative estimate; relative availability is not power in watts.
                </div>
              </div>
            ) : null}

            <p className="mt-4 text-sm leading-6 text-text">{selected.description}</p>
            <p className="mt-3 text-xs leading-5 text-muted">{selected.scientificSignificance}</p>

            <div className="mt-4 border-t border-border pt-3">
              <p className="text-[10px] uppercase tracking-wide text-muted">Potential advantages</p>
              <ul className="mt-1 space-y-1 text-xs leading-5 text-muted">
                {selected.advantages.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
            <div className="mt-3 border-t border-border pt-3">
              <p className="text-[10px] uppercase tracking-wide text-muted">Potential limitations</p>
              <ul className="mt-1 space-y-1 text-xs leading-5 text-muted">
                {selected.limitations.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>

            <div className="mt-4 border-t border-border pt-3">
              <p className="text-[10px] uppercase tracking-wide text-muted">Suitability indicators</p>
              <div className="mt-2 space-y-2">
                {profile.suitability.map((indicator) => (
                  <div key={indicator.category} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted">{indicator.category}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[9px] ${statusStyles[indicator.status]}`}>
                      {indicator.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-4 rounded-lg border border-dashed border-amber-400/30 bg-space/50 p-2.5 text-[10px] leading-4 text-muted">
              Site terrain is procedural and illustrative. Global lunar imagery is NASA SVS LROC/LOLA data.
              Solar outputs are simplified estimates, not predictive illumination windows.
            </p>
          </aside>
        ) : null}
      </div>

      {mode === 'sunlight' ? (
        <div className="shrink-0 border-t border-border bg-panel/95 px-4 py-3 backdrop-blur">
          <SimulationTimeline
            timeFraction={sunlight.timeFraction}
            setTimeFraction={sunlight.setTimeFraction}
            playing={sunlight.playing}
            setPlaying={sunlight.setPlaying}
            speed={sunlight.speed}
            setSpeed={sunlight.setSpeed}
            resetSimulation={sunlight.resetSimulation}
            simulation={sunlight.simulation}
            compact
          />
        </div>
      ) : null}
    </div>
  )
}
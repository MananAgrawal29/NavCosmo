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
  Promising: 'text-text',
  Conditional: 'text-muted',
  Challenging: 'text-warning',
  'Requires further data': 'text-muted',
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
        <p className="text-xs text-muted">Comparative analysis</p>
        <h1 className="mt-2 font-display text-2xl font-normal text-text">Shackleton vs. Malapert</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          Side-by-side mission considerations for the two candidate south-pole locations. Entries
          are qualitative and illustrative, not measured comparisons.
        </p>
      </div>

      <div className="grid gap-x-8 gap-y-6 lg:grid-cols-2">
        {[shackleton, malapert].map((site) => (
          <div key={site.id} className="border-t border-border pt-4">
            <h2 className="font-display text-xl font-normal text-text">{site.name}</h2>
            <p className="mt-1 text-xs text-muted">{site.region}</p>
            <p className="mt-2 text-xs text-muted">
              {site.latitude.toFixed(1)}°, {site.longitude.toFixed(1)}° · approximate candidate
            </p>
            <p className="mt-3 text-sm leading-5 text-muted">{site.description}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted">Advantages</p>
                <ul className="mt-1 space-y-1 text-xs leading-5 text-muted">
                  {site.advantages.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-xs text-warning">Limitations</p>
                <ul className="mt-1 space-y-1 text-xs leading-5 text-muted">
                  {site.limitations.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-[2px] border border-border bg-card/90">
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
                      <span className={`inline-flex border-l-2 pl-2 text-xs ${indicator ? statusStyles[indicator.status] : 'text-muted'}`}>
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

      <p className="border-l-2 border-warning bg-card/80 p-3 text-xs leading-5 text-muted">
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
  const [wideLayout, setWideLayout] = useState(() => window.innerWidth >= 768)
  const [viewportMode, setViewportMode] = useState<WorkspaceMode>(mode)
  const sunlight = useSunlightSimulation(selected.id, mode === 'sunlight')

  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)')
    const update = () => setWideLayout(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

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
    setRightOpen(true)
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

  const hudInsetLeft = wideLayout && leftOpen ? 296 : 12
  const hudInsetRight = wideLayout && rightOpen ? 344 : 12

  const comparisonPadding = `pt-4 pb-6 ${leftOpen ? 'lg:pl-72' : 'lg:pl-4'} ${
    rightOpen ? 'lg:pr-96' : 'lg:pr-4'
  }`

  return (
    <div className="relative flex min-h-[calc(100dvh-6.375rem)] flex-col overflow-hidden bg-space lg:h-[calc(100dvh-6.375rem)]">
      <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-border bg-panel px-1.5 sm:px-2">
        <div className="flex min-w-0 items-center gap-0.5">
          {modes.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                aria-label={item.label}
                aria-pressed={mode === item.id}
                title={item.label}
                className={`inline-flex min-h-11 items-center gap-2 rounded-[2px] border-b-2 px-2 text-sm font-medium transition sm:px-3 ${
                  mode === item.id
                    ? 'border-accent text-text'
                    : 'border-transparent text-muted hover:text-text'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            )
          })}
        </div>

        <div className="flex shrink-0 items-center gap-1 border-l border-border pl-1.5">
          <button
            type="button"
            onClick={toggleLeftPanel}
            aria-label={leftOpen ? 'Hide site rail' : 'Show site rail'}
            aria-expanded={leftOpen}
            aria-controls="site-rail"
            title={leftOpen ? 'Hide site rail' : 'Show site rail'}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-[2px] border transition ${
              leftOpen
                ? 'border-border-strong bg-hover text-text'
                : 'border-transparent text-muted hover:bg-hover hover:text-text'
            }`}
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={toggleRightPanel}
            aria-label={rightOpen ? 'Hide inspector' : 'Show inspector'}
            aria-expanded={rightOpen}
            aria-controls="site-inspector"
            title={rightOpen ? 'Hide inspector' : 'Show inspector'}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-[2px] border transition ${
              rightOpen
                ? 'border-border-strong bg-hover text-text'
                : 'border-transparent text-muted hover:bg-hover hover:text-text'
            }`}
          >
            <PanelRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative min-h-[62vh] flex-1 overflow-hidden">
        {viewportMode === 'global' ? (
          <MoonViewer
            height="100%"
            className="h-full rounded-none border-0"
            selectedSiteId={selected.id}
            onSiteSelect={setSite}
            hudInsetLeft={hudInsetLeft}
            hudInsetRight={hudInsetRight}
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
            hudInsetLeft={hudInsetLeft}
            hudInsetRight={hudInsetRight}
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
          <aside
            id="site-rail"
            className="absolute inset-x-3 bottom-3 top-3 z-20 overflow-y-auto overscroll-contain rounded-[2px] border border-border bg-panel p-4 shadow-[var(--shadow-panel)] md:inset-x-auto md:left-3 md:w-[17rem]"
          >
            <p className="text-xs text-muted">Candidate sites</p>
            <div className="mt-3 space-y-2">
              {lunarSites.map((site) => (
                <button
                  key={site.id}
                  type="button"
                  onClick={() => setSite(site.id)}
                  className={`w-full rounded-[2px] border px-3 py-2.5 text-left transition ${
                    site.id === selected.id
                      ? 'border-border border-l-[3px] border-l-accent bg-hover'
                      : 'border-border bg-card/70 hover:border-border-strong hover:bg-hover'
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-text">{site.name}</span>
                    {site.id === selected.id ? <span className="h-1.5 w-1.5 rounded-full bg-accent" /> : null}
                  </span>
                  <span className="mt-1 block text-xs tabular-nums text-muted">
                    {site.latitude.toFixed(1)}°, {site.longitude.toFixed(1)}°
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <p className="text-xs text-muted">Current view</p>
              <p className="mt-1 text-sm capitalize text-text">{mode === 'compare' ? 'Site comparison' : mode}</p>

            </div>

            <div className="mt-5 border-t border-border pt-4">
              <Link
                to={`/analysis?site=${selected.id}`}
                className="flex items-center justify-between gap-2 rounded-[2px] px-2 py-2 text-xs text-muted transition hover:bg-hover hover:text-text"
              >
                Full site report
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
              <p className="mt-3 text-xs leading-5 text-muted">
                Coordinates are approximate candidate locations, not verified landing sites.
              </p>
            </div>
          </aside>
        ) : null}

        {rightOpen ? (
          <aside
            id="site-inspector"
            className="absolute inset-x-3 bottom-3 top-3 z-20 overflow-y-auto overscroll-contain rounded-[2px] border border-border bg-panel p-4 shadow-[var(--shadow-panel)] md:inset-x-auto md:right-3 md:w-80"
          >
            <div>
              <p className="text-xs text-muted">Selected site</p>
              <h2 className="mt-1 font-display text-[1.75rem] font-normal leading-tight text-text">{selected.name}</h2>
              <p className="mt-0.5 text-xs text-muted">{selected.region}</p>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-[2px] border border-border bg-space/60 px-2.5 py-2 text-xs tabular-nums text-muted">
              <MapPin className="h-3.5 w-3.5 text-muted" />
              <span>{selected.latitude.toFixed(1)}°, {selected.longitude.toFixed(1)}° · approximate candidate</span>
            </div>

            {mode === 'sunlight' ? (
              <dl className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-xs text-muted">Sun elevation</dt>
                  <dd className="mt-0.5 tabular-nums text-sm text-text">
                    {sunlight.simulation.elevationDeg >= 0 ? '+' : ''}
                    {sunlight.simulation.elevationDeg.toFixed(1)}°
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Terrain lit</dt>
                  <dd className="mt-0.5 tabular-nums text-sm text-text">
                    {(sunlight.simulation.illuminatedFraction * 100).toFixed(0)}%
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Relative solar</dt>
                  <dd className="mt-0.5 tabular-nums text-sm text-solar">
                    {sunlight.simulation.solarAvailability.toFixed(0)}%
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Illumination</dt>
                  <dd className="mt-0.5 text-xs text-text">{sunlight.simulation.illuminationStatus}</dd>
                </div>
                <div className="col-span-2 border-l-2 border-warning bg-card/60 p-2.5 text-xs leading-5 text-muted">
                  {sunlight.simulation.shadowCondition}. Illustrative estimate; relative availability is not power in watts.
                </div>
              </dl>
            ) : null}

            <p className="mt-4 text-sm leading-6 text-text">{selected.description}</p>
            <p className="mt-3 text-xs leading-5 text-muted">{selected.scientificSignificance}</p>

            <div className="mt-4 border-t border-border pt-3">
              <p className="text-xs text-muted">Potential advantages</p>
              <ul className="mt-1 space-y-1 text-xs leading-5 text-muted">
                {selected.advantages.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
            <div className="mt-3 border-t border-border pt-3">
              <p className="text-xs text-muted">Potential limitations</p>
              <ul className="mt-1 space-y-1 text-xs leading-5 text-muted">
                {selected.limitations.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>

            <div className="mt-4 border-t border-border pt-3">
              <p className="text-xs text-muted">Suitability indicators</p>
              <div className="mt-2 space-y-2">
                {profile.suitability.map((indicator) => (
                  <div key={indicator.category} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted">{indicator.category}</span>
                    <span className={`border-l-2 pl-2 text-xs ${statusStyles[indicator.status]}`}>
                      {indicator.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-4 border-l-2 border-warning bg-space/50 p-2.5 text-xs leading-5 text-muted">
              Site terrain is procedural and illustrative. Global lunar imagery is NASA SVS LROC/LOLA data.
              Solar outputs are simplified estimates, not predictive illumination windows.
            </p>
          </aside>
        ) : null}
      </div>

      {mode === 'sunlight' ? (
        <div className="shrink-0 border-t border-border bg-panel px-4 py-3">
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
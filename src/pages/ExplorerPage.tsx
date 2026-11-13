import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import MoonViewer from '../components/common/MoonViewer'
import { Card, SectionHeader } from '../components/common/Card'
import SiteCard from '../components/common/SiteCard'
import { lunarSites, getSiteById } from '../data/lunarSites'

export default function ExplorerPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [resetSignal, setResetSignal] = useState(0)
  const selected = getSiteById(searchParams.get('site') ?? '') ?? lunarSites[0]
  const selectedId = selected.id

  const setSelectedId = (siteId: string) => {
    setSearchParams({ site: siteId }, { replace: true })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text">Lunar Explorer</h1>
        <p className="mt-2 max-w-3xl text-muted">
          Drag to rotate the Moon, scroll to zoom, and select a candidate marker to inspect its
          context. Marker coordinates are approximate candidates, not verified landing sites.
        </p>
      </div>

      <MoonViewer
        height="clamp(380px, 48vw, 560px)"
        selectedSiteId={selectedId}
        onSiteSelect={setSelectedId}
        resetSignal={resetSignal}
        caption="Drag to rotate · Scroll to zoom · Select a marker"
      />

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionHeader
            title="Select a Candidate Site"
            subtitle="Choose a location to inspect its approximate surface position and mission context."
          />
          <div className="space-y-4">
            {lunarSites.map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                selected={site.id === selectedId}
                onSelect={setSelectedId}
              />
            ))}
          </div>
        </div>

        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <SectionHeader title={selected.name} subtitle={selected.region} />
            <span className="rounded-[2px] border border-border-strong bg-hover px-2.5 py-1 text-xs text-text">
              Selected candidate
            </span>
          </div>

          <dl className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Latitude (approx.)</dt>
                <dd className="mt-1 text-text">{selected.latitude.toFixed(1)}°</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Longitude (approx.)</dt>
                <dd className="mt-1 text-text">{selected.longitude.toFixed(1)}°</dd>
              </div>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Description</dt>
              <dd className="mt-1 text-text">{selected.description}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Scientific Significance</dt>
              <dd className="mt-1 text-muted">{selected.scientificSignificance}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Potential Advantages</dt>
              <dd className="mt-1 text-muted">{selected.advantages.join(' • ')}</dd>
            </div>
          </dl>

          <div className="mt-5 rounded-[2px] border border-border border-l-2 border-l-warning bg-panel p-3 text-xs leading-5 text-muted">
            Marker positions are approximate candidate coordinates derived from latitude and
            longitude. They are not precise landing-site survey coordinates.
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to={`/analysis?site=${selected.id}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-[2px] bg-accent px-3 py-2 text-sm font-medium text-on-accent transition hover:bg-accent/90"
            >
              Explore detailed terrain
            </Link>
            <button
              type="button"
              onClick={() => setResetSignal((value) => value + 1)}
              className="inline-flex min-h-11 items-center gap-2 rounded-[2px] border border-border px-3 py-2 text-sm text-text transition hover:border-border-strong hover:bg-hover"
            >
              <RotateCcw className="h-4 w-4" />
              Return to global Moon view
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
import { useState } from 'react'
import MoonViewer from '../components/common/MoonViewer'
import { Card, SectionHeader } from '../components/common/Card'
import SiteCard from '../components/common/SiteCard'
import { lunarSites, getSiteById } from '../data/lunarSites'

export default function ExplorerPage() {
  const [selectedId, setSelectedId] = useState(lunarSites[0].id)
  const selected = getSiteById(selectedId) ?? lunarSites[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text">Lunar Explorer</h1>
        <p className="mt-2 text-muted">
          A large interactive 3D Moon will be integrated here in P01. This foundation provides the
          reserved visualization area and site-selection workflow.
        </p>
      </div>

      <MoonViewer height="520px" caption="Reserved 3D Moon viewport. Authentic terrain and sunlight simulation are not implemented yet." />

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionHeader title="Select a Candidate Site" subtitle="Choose a location to inspect its mission context." />
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
          <SectionHeader title={selected.name} subtitle={selected.region} />
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Description</dt>
              <dd className="mt-1 text-text">{selected.description}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Coordinates (illustrative)</dt>
              <dd className="mt-1 text-text">
                {selected.latitude.toFixed(1)}°, {selected.longitude.toFixed(1)}°
              </dd>
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
        </Card>
      </div>
    </div>
  )
}
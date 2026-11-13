import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, MapPin } from 'lucide-react'
import TerrainViewer from '../components/common/TerrainViewer'
import { Card, SectionHeader } from '../components/common/Card'
import { lunarSites, getSiteById } from '../data/lunarSites'
import { getSiteProfile, type SuitabilityStatus } from '../data/siteProfiles'

const statusStyles: Record<SuitabilityStatus, string> = {
  Promising: 'border-accent2/40 bg-accent2/10 text-accent2',
  Conditional: 'border-amber-400/40 bg-amber-400/10 text-amber-200',
  Challenging: 'border-rose-400/40 bg-rose-400/10 text-rose-200',
  'Requires further data': 'border-accent/40 bg-accent/10 text-accent',
}

export default function AnalysisPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selected = getSiteById(searchParams.get('site') ?? '') ?? lunarSites[0]
  const profile = getSiteProfile(selected.id)

  const selectSite = (siteId: string) => {
    setSearchParams({ site: siteId }, { replace: true })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            Detailed site exploration
          </p>
          <h1 className="mt-2 text-3xl font-bold text-text">{selected.name}</h1>
          <p className="mt-2 max-w-3xl text-muted">
            Explore an illustrative terrain surface and review the scientific context, mission
            considerations, and data gaps for this approximate candidate location.
          </p>
        </div>
        <Link
          to={`/explorer?site=${selected.id}`}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-text transition hover:border-accent/50 hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          Global Moon
        </Link>
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
          <TerrainViewer siteId={selected.id} siteName={selected.name} />
          <div className="rounded-xl border border-dashed border-amber-400/30 bg-card p-3 text-xs leading-5 text-muted">
            <p className="font-medium text-amber-200/80">Illustrative terrain visualization</p>
            <p className="mt-1">
              This surface is procedurally generated to demonstrate the exploration interface. It
              is not a digital elevation model, slope map, hazard map, or NASA observation. High
              resolution LROC/LOLA site data has not been integrated.
            </p>
          </div>
        </div>

        <Card>
          <SectionHeader title={selected.name} subtitle={selected.region} />
          <div className="flex items-center gap-2 rounded-lg border border-border bg-panel px-3 py-2 text-xs text-muted">
            <MapPin className="h-3.5 w-3.5 text-accent" />
            {selected.latitude.toFixed(1)}°, {selected.longitude.toFixed(1)}° · approximate candidate
          </div>
          <p className="mt-4 text-sm leading-6 text-text">{selected.description}</p>
          <p className="mt-3 text-sm leading-6 text-muted">{selected.scientificSignificance}</p>

          <div className="mt-5 border-t border-border pt-4">
            <p className="text-xs uppercase tracking-wide text-muted">Established scientific context</p>
            <ul className="mt-2 space-y-2 text-sm leading-5 text-muted">
              {profile.establishedContext.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>

          <Link
            to={`/explorer?site=${selected.id}`}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text transition hover:border-accent/50 hover:text-accent"
          >
            Return to global 3D Moon
          </Link>
        </Card>
      </div>

      <section>
        <SectionHeader
          title="Landing Suitability Indicators"
          subtitle="Qualitative mission-planning indicators. These are not numerical scores or measured site properties."
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {profile.suitability.map((indicator) => (
            <Card key={indicator.category} className="flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-text">{indicator.category}</p>
              </div>
              <span
                className={`mt-3 inline-flex w-fit rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusStyles[indicator.status]}`}
              >
                {indicator.status}
              </span>
              <p className="mt-3 text-xs leading-5 text-muted">{indicator.reason}</p>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionHeader
            title="Potential mission considerations"
            subtitle="Potential advantages and planning factors — not verified measurements."
          />
          <ul className="space-y-3 text-sm leading-5 text-muted">
            {profile.potentialMissionFactors.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <SectionHeader
            title="Challenges and data gaps"
            subtitle="Operational concerns and information needed before a landing assessment."
          />
          <ul className="space-y-3 text-sm leading-5 text-muted">
            {profile.challenges.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <SectionHeader title="Terrain data status" subtitle="Scientific integrity note" />
        <div className="grid gap-3 text-sm text-muted md:grid-cols-3">
          <div className="rounded-lg border border-dashed border-border bg-panel p-3">
            <p className="text-xs uppercase tracking-wide text-amber-200/80">Data unavailable</p>
            <p className="mt-1">Site-specific LROC stereo imagery and LOLA elevation products are not integrated.</p>
          </div>
          <div className="rounded-lg border border-dashed border-border bg-panel p-3">
            <p className="text-xs uppercase tracking-wide text-accent">Illustrative visualization</p>
            <p className="mt-1">Terrain geometry and colors are procedural demonstrations of the intended analysis workflow.</p>
          </div>
          <div className="rounded-lg border border-dashed border-border bg-panel p-3">
            <p className="text-xs uppercase tracking-wide text-muted">Next data step</p>
            <p className="mt-1">Integrate authenticated lunar terrain data before treating slope or elevation views as scientific evidence.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
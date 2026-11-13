import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Satellite, Telescope } from 'lucide-react'
import MoonViewer from '../components/common/MoonViewer'
import { Card, StatCard, SectionHeader } from '../components/common/Card'
import SiteCard from '../components/common/SiteCard'
import { lunarSites, getSiteById } from '../data/lunarSites'

export default function OverviewPage() {
  const [selectedId, setSelectedId] = useState(lunarSites[0].id)
  const selected = getSiteById(selectedId) ?? lunarSites[0]

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-medium text-accent">NASA Space Apps Challenge 2026</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-text md:text-5xl">
            NavCosmo
          </h1>
          <p className="mt-2 text-xl text-accent2">Explore. Analyze. Navigate the Moon.</p>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
            NavCosmo is an interactive lunar landing-site exploration platform. Examine candidate
            south-pole locations, inspect illustrative terrain and sunlight, and compare mission
            considerations in one unified workspace.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/workspace"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-space transition hover:bg-accent/90"
            >
              Open Mission Workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/workspace?mode=compare"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-text transition hover:border-accent/40"
            >
              Compare Sites
            </Link>
          </div>
        </div>
        <MoonViewer
          height="clamp(320px, 34vw, 360px)"
          selectedSiteId={selectedId}
          onSiteSelect={setSelectedId}
          caption="Interactive south-pole view · Drag to rotate · Scroll to zoom"
        />
      </section>

      <section>
        <SectionHeader
          title="Candidate Landing Sites"
          subtitle="Two initial south-pole candidates for exploration and comparison."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {lunarSites.map((site) => (
            <SiteCard
              key={site.id}
              site={site}
              selected={site.id === selectedId}
              onSelect={setSelectedId}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Candidate Sites" value={String(lunarSites.length)} detail="Shackleton Crater and Malapert Massif" />
        <StatCard label="Selected Site" value={selected.name} detail={selected.region} />
        <StatCard label="Data Status" value="Illustrative site layers" detail="NASA global imagery; procedural terrain and simplified solar model" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <SectionHeader title="Selected Site Information" subtitle="Information shown is labelled as illustrative where measurements are unavailable." />
          <div className="space-y-3 text-sm">
            <p className="text-text">{selected.description}</p>
            <p className="text-muted">{selected.scientificSignificance}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Latitude (approx.)</p>
                <p className="mt-1 text-text">{selected.latitude.toFixed(1)}°</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Longitude (approx.)</p>
                <p className="mt-1 text-text">{selected.longitude.toFixed(1)}°</p>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <SectionHeader title="Mission Information" subtitle="Current unified workspace scope." />
          <div className="space-y-3 text-sm text-muted">
            <div className="flex items-start gap-3">
              <Satellite className="mt-0.5 h-4 w-4 text-accent" />
              <p>Client-side prototype with no backend, authentication, or database.</p>
            </div>
            <div className="flex items-start gap-3">
              <Telescope className="mt-0.5 h-4 w-4 text-accent" />
              <p>Site terrain and solar readouts are illustrative; global lunar imagery is attributed NASA data.</p>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-accent" />
              <p>Global Moon, terrain, sunlight, and site comparison modes are available in the mission workspace.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-2">
            <Link to="/workspace" className="rounded-lg border border-border px-3 py-2 text-sm text-text transition hover:border-accent/40">
              Open Mission Workspace
            </Link>
            <Link to="/analysis" className="rounded-lg border border-border px-3 py-2 text-sm text-text transition hover:border-accent/40">
              Review Site Analysis
            </Link>
          </div>
        </Card>
      </section>
    </div>
  )
}
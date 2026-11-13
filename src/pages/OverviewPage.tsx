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
            south-pole locations, compare mission considerations, and prepare for future terrain,
            illumination, and resource analysis.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/explorer"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-space transition hover:bg-accent/90"
            >
              Enter Lunar Explorer
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/comparison"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-text transition hover:border-accent/40"
            >
              Compare Sites
            </Link>
          </div>
        </div>
        <MoonViewer height="360px" caption="Illustrative Moon preview. Authentic datasets arrive in P01." />
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
        <StatCard label="Data Status" value="Illustrative" detail="NASA measurements will be integrated later" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <SectionHeader title="Selected Site Information" subtitle="Information shown is labelled as illustrative where measurements are unavailable." />
          <div className="space-y-3 text-sm">
            <p className="text-text">{selected.description}</p>
            <p className="text-muted">{selected.scientificSignificance}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Latitude</p>
                <p className="mt-1 text-text">{selected.latitude.toFixed(1)}°</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Longitude</p>
                <p className="mt-1 text-text">{selected.longitude.toFixed(1)}°</p>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <SectionHeader title="Mission Information" subtitle="Foundation scope for P00." />
          <div className="space-y-3 text-sm text-muted">
            <div className="flex items-start gap-3">
              <Satellite className="mt-0.5 h-4 w-4 text-accent" />
              <p>No backend, authentication, or database is used in this foundation build.</p>
            </div>
            <div className="flex items-start gap-3">
              <Telescope className="mt-0.5 h-4 w-4 text-accent" />
              <p>Scientific values shown are placeholders and are not authentic NASA observations.</p>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-accent" />
              <p>Interactive terrain, illumination simulation, and site comparison arrive in later milestones.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-2">
            <Link to="/explorer" className="rounded-lg border border-border px-3 py-2 text-sm text-text transition hover:border-accent/40">
              Open Lunar Explorer
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
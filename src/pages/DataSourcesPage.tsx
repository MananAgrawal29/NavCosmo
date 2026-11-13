import { Link } from 'react-router-dom'
import { ArrowUpRight, Database, Moon, Sun } from 'lucide-react'
import { Card, SectionHeader } from '../components/common/Card'

export default function DataSourcesPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-accent">Transparency</p>
        <h1 className="mt-2 text-3xl font-bold text-text">Data & Sources</h1>
        <p className="mt-2 max-w-3xl text-muted">
          NavCosmo combines attributed public lunar imagery with clearly marked illustrative and
          simulated layers. These categories are not interchangeable.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionHeader title="Authentic NASA imagery" subtitle="Global lunar globe" />
          <div className="flex items-start gap-3 text-sm leading-6 text-muted">
            <Moon className="mt-1 h-4 w-4 shrink-0 text-accent" />
            <p>
              The global Moon uses the NASA Scientific Visualization Studio CGI Moon Kit color map
              and LOLA-derived relief texture, based on LRO LROC and LOLA data.
            </p>
          </div>
          <a
            href="https://svs.gsfc.nasa.gov/4720/"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-xs text-accent hover:text-accent/80"
          >
            NASA SVS CGI Moon Kit
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </Card>

        <Card>
          <SectionHeader title="Illustrative site terrain" subtitle="Surface and sunlight modes" />
          <div className="flex items-start gap-3 text-sm leading-6 text-muted">
            <Database className="mt-1 h-4 w-4 shrink-0 text-amber-200" />
            <p>
              Site terrain is procedurally generated for interface demonstration. It is not a
              digital elevation model, hazard map, or authentic Shackleton/Malapert observation.
            </p>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Simplified solar model" subtitle="Sunlight Lab" />
          <div className="flex items-start gap-3 text-sm leading-6 text-muted">
            <Sun className="mt-1 h-4 w-4 shrink-0 text-amber-200" />
            <p>
              Sun elevation follows a sinusoidal 29.53-day cycle. Azimuth rotates once per cycle.
              No lunar ephemeris, libration, or local horizon model is used. Site-specific maximum
              Sun elevations are illustrative parameters, and shadows and relative solar
              availability are illustrative, not predictive.
            </p>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Candidate coordinates" subtitle="Approximate only" />
          <p className="text-sm leading-6 text-muted">
            Shackleton Crater and Malapert Massif markers use approximate candidate coordinates,
            not verified landing-site survey positions. Qualitative suitability labels are planning
            indicators rather than measured scores.
          </p>
        </Card>
      </div>

      <Link
        to="/workspace"
        className="inline-flex rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-text transition hover:border-accent/50 hover:text-accent"
      >
        Return to Mission Workspace
      </Link>
    </div>
  )
}
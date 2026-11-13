import { useState } from 'react'
import { Card, SectionHeader } from '../components/common/Card'
import { lunarSites, getSiteById } from '../data/lunarSites'

const categories = [
  {
    title: 'Terrain Safety',
    sample: 'Illustrative sample: landing-slope, boulder density, and hazard maps are not yet connected to authentic elevation data.',
  },
  {
    title: 'Solar Illumination',
    sample: 'Illustrative sample: Sun-angle coverage and shadow duration will be calculated from future terrain and ephemeris models.',
  },
  {
    title: 'Communication',
    sample: 'Illustrative sample: line-of-sight and relay considerations are placeholders pending authentic orbital and terrain inputs.',
  },
  {
    title: 'Resource Accessibility',
    sample: 'Illustrative sample: proximity to permanently shadowed regions and volatile interest areas is descriptive only.',
  },
  {
    title: 'Scientific Value',
    sample: 'Illustrative sample: research priority is summarized from mission planning notes, not measured observations.',
  },
]

export default function AnalysisPage() {
  const [selectedId, setSelectedId] = useState(lunarSites[0].id)
  const selected = getSiteById(selectedId) ?? lunarSites[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text">Site Analysis</h1>
        <p className="mt-2 text-muted">
          Structured analysis layout for {selected.name}. All values below are labelled illustrative
          placeholders until NASA datasets are integrated.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {lunarSites.map((site) => (
          <button
            key={site.id}
            type="button"
            onClick={() => setSelectedId(site.id)}
            className={`rounded-xl border px-4 py-2 text-sm transition ${
              site.id === selectedId
                ? 'border-accent bg-accent/15 text-accent'
                : 'border-border bg-card text-muted hover:text-text'
            }`}
          >
            {site.name}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((category) => (
          <Card key={category.title}>
            <SectionHeader title={category.title} subtitle="Illustrative sample data" />
            <p className="text-sm leading-6 text-muted">{category.sample}</p>
            <div className="mt-4 rounded-lg border border-dashed border-border bg-panel p-3 text-xs text-muted">
              Status: placeholder — authentic NASA LRO/LOLA/LROC or Moon Trek data not yet integrated.
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <SectionHeader title="Site Context" subtitle={selected.name} />
        <p className="text-sm text-muted">{selected.scientificSignificance}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Potential Advantages</p>
            <ul className="mt-2 space-y-1 text-sm text-text">
              {selected.advantages.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Potential Limitations</p>
            <ul className="mt-2 space-y-1 text-sm text-text">
              {selected.limitations.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
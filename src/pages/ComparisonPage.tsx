import { Card, SectionHeader } from '../components/common/Card'
import { lunarSites } from '../data/lunarSites'

export default function ComparisonPage() {
  const [shackleton, malapert] = lunarSites

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text">Site Comparison</h1>
        <p className="mt-2 text-muted">
          Basic side-by-side comparison of Shackleton Crater and Malapert Massif. Entries describe
          mission considerations and are not authentic measurements.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {[shackleton, malapert].map((site) => (
          <Card key={site.id}>
            <SectionHeader title={site.name} subtitle={site.region} />
            <p className="text-sm text-muted">{site.description}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Latitude</p>
                <p className="mt-1 text-text">{site.latitude.toFixed(1)}°</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Longitude</p>
                <p className="mt-1 text-text">{site.longitude.toFixed(1)}°</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <SectionHeader title="Mission Considerations" subtitle="Illustrative comparison" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="py-3 pr-4 font-medium">Category</th>
                <th className="py-3 pr-4 font-medium">Shackleton Crater</th>
                <th className="py-3 font-medium">Malapert Massif</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-3 pr-4 text-muted">Primary strength</td>
                <td className="py-3 pr-4 text-text">Water-ice and volatile science</td>
                <td className="py-3 text-text">Illumination and communication studies</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 pr-4 text-muted">Main risk</td>
                <td className="py-3 pr-4 text-text">Cold, shadow, and rugged terrain</td>
                <td className="py-3 text-text">Steep slopes and uncharacterized surface</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-muted">Mission note</td>
                <td className="py-3 pr-4 text-text">High scientific priority near south pole</td>
                <td className="py-3 text-text">Potential operational visibility advantages</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {lunarSites.map((site) => (
          <Card key={site.id}>
            <h3 className="text-lg font-semibold text-text">{site.name}</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted">Advantages</p>
                <ul className="mt-2 space-y-1 text-sm text-muted">
                  {site.advantages.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs text-warning">Limitations</p>
                <ul className="mt-2 space-y-1 text-sm text-muted">
                  {site.limitations.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
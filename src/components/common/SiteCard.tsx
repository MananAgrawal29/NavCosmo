import type { LunarSite } from '../../types/lunarSite'
import { Card } from './Card'

interface SiteCardProps {
  site: LunarSite
  selected?: boolean
  onSelect?: (id: string) => void
}

export default function SiteCard({ site, selected = false, onSelect }: SiteCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(site.id)}
      className={`w-full text-left ${onSelect ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <Card
        className={`transition ${selected ? 'border-accent ring-1 ring-accent/40' : 'hover:border-accent/40'}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-text">{site.name}</h3>
            <p className="mt-1 text-sm text-accent2">{site.region}</p>
          </div>
          <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted">
            Candidate
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted">{site.description}</p>
        <p className="mt-3 text-sm text-text/80">{site.scientificSignificance}</p>
      </Card>
    </button>
  )
}
import type { LunarSite } from '../../types/lunarSite'

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
      className={`w-full border-t border-border px-1 py-4 text-left transition ${
        selected ? 'border-l-[3px] border-l-accent pl-3' : 'hover:border-border-strong hover:bg-hover'
      } ${onSelect ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-normal text-text">{site.name}</h3>
          <p className="mt-1 text-xs text-muted">{site.region}</p>
        </div>
        <span className="text-xs tabular-nums text-muted">
          {site.latitude.toFixed(1)}°, {site.longitude.toFixed(1)}°
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted">{site.description}</p>
      <p className="mt-3 text-sm leading-6 text-text/80">{site.scientificSignificance}</p>
    </button>
  )
}
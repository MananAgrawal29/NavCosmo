import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Globe2, BarChart3, Scale, Moon } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/explorer', label: 'Lunar Explorer', icon: Globe2 },
  { to: '/analysis', label: 'Site Analysis', icon: BarChart3 },
  { to: '/comparison', label: 'Site Comparison', icon: Scale },
]

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-space/70 backdrop-blur-sm transition md:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed left-0 top-0 z-40 h-full w-64 border-r border-border bg-panel transition-transform md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent/40 bg-accent/10">
            <Moon className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text">NavCosmo</p>
            <p className="text-xs text-muted">Explore. Analyze. Navigate the Moon.</p>
          </div>
        </div>
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    isActive
                      ? 'bg-accent/15 text-accent'
                      : 'text-muted hover:bg-card hover:text-text'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted">NASA Space Apps Challenge 2026</p>
          <p className="mt-1 text-sm text-text">P01 interactive Moon</p>
        </div>
      </aside>
    </>
  )
}
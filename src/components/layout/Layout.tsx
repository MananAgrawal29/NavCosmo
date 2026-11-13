import type { ReactNode } from 'react'
import { Link, NavLink, useLocation, useSearchParams } from 'react-router-dom'
import { MapPin, Moon } from 'lucide-react'
import { getSiteById, lunarSites } from '../../data/lunarSites'

function HeaderLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `inline-flex min-h-11 items-center rounded-[2px] px-2.5 text-xs transition md:text-sm ${
          isActive ? 'bg-hover text-text' : 'text-muted hover:bg-hover hover:text-text'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isWorkspace = location.pathname.startsWith('/workspace')
  const selected = getSiteById(searchParams.get('site') ?? '') ?? lunarSites[0]

  return (
    <div className="min-h-screen bg-space text-text">
      <header className="sticky top-0 z-30 border-b border-border bg-panel pt-[env(safe-area-inset-top)]">
        <div className="flex h-14 items-center justify-between gap-3 px-3 md:px-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link
              to="/workspace"
              aria-label="NavCosmo — Mission Workspace"
              className="flex min-h-11 items-center gap-2 rounded-[2px] text-text transition hover:text-text"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-[2px] border border-border bg-card">
                <Moon className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium tracking-tight">NavCosmo</span>
            </Link>
            <span aria-hidden="true" className="hidden h-4 w-px bg-border sm:block" />
            <nav aria-label="Primary" className="flex items-center gap-0.5">
              <HeaderLink to="/sources">Data &amp; Sources</HeaderLink>
              <HeaderLink to="/about">About</HeaderLink>
            </nav>
          </div>

          <div className="hidden min-w-0 items-center gap-1.5 text-xs text-muted lg:flex">
            {isWorkspace ? (
              <>
                <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate tabular-nums">
                  {selected.name} · {selected.latitude.toFixed(1)}°,{' '}
                  {selected.longitude.toFixed(1)}° · approximate candidate
                </span>
              </>
            ) : (
              <span className="truncate">NASA Space Apps Challenge 2026</span>
            )}
          </div>
        </div>
      </header>

      <main
        className={
          isWorkspace ? 'w-full p-0' : 'mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8'
        }
      >
        {children}
      </main>
    </div>
  )
}

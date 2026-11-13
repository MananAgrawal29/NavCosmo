import { Link } from 'react-router-dom'
import { Card, SectionHeader } from '../components/common/Card'

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-accent">
          NASA Space Apps Challenge 2026
        </p>
        <h1 className="mt-2 text-3xl font-bold text-text">About NavCosmo</h1>
        <p className="mt-2 max-w-3xl text-muted">
          Explore. Analyze. Navigate the Moon. NavCosmo is an interactive lunar landing-site
          exploration workspace for comparing candidate south-pole locations and examining mission
          considerations.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionHeader title="What the workspace does" />
          <ul className="space-y-2 text-sm leading-6 text-muted">
            <li>• Explores a rotating 3D Moon with candidate-site markers.</li>
            <li>• Examines procedural terrain in natural, elevation, and slope modes.</li>
            <li>• Demonstrates changing illumination through a simplified solar simulator.</li>
            <li>• Compares Shackleton Crater and Malapert Massif without leaving the workspace.</li>
          </ul>
        </Card>
        <Card>
          <SectionHeader title="Scientific scope" />
          <p className="text-sm leading-6 text-muted">
            This is a presentation and exploration prototype, not a mission-planning tool. Global
            imagery is attributed NASA data; site terrain is illustrative; solar conditions are
            simplified estimates. No authentic site-specific DEM or ephemeris is currently used.
          </p>
        </Card>
      </div>

      <Link
        to="/workspace"
        className="inline-flex rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-text transition hover:border-accent/50 hover:text-accent"
      >
        Open Mission Workspace
      </Link>
    </div>
  )
}
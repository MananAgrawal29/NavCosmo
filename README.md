# NavCosmo

Explore. Analyze. Navigate the Moon.

NavCosmo is an interactive lunar landing-site exploration platform built for NASA Space Apps Challenge 2026. The P04 build unifies the 3D Moon, site terrain, sunlight simulation, and comparison tools into one mission workspace.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Three.js / React Three Fiber / Drei
- React Router
- Lucide React

## P01 Interactive Moon

The Lunar Explorer now renders a textured 3D lunar sphere with directional sunlight, a star field, drag rotation, scroll zoom, camera reset controls, and selectable candidate markers for Shackleton Crater and Malapert Massif.

Marker positions are derived from approximate candidate latitude/longitude values using an equirectangular lunar coordinate convention (0° longitude faces +X, east longitude increases toward -Z, north latitude toward +Y). They are not verified landing-site survey coordinates.

Moon textures are provided by NASA's Scientific Visualization Studio CGI Moon Kit, derived from LRO LROC color and LOLA elevation data. See `public/textures/CREDITS.md`. The textures are used for visual rendering, not scientific measurement.

## P02 Site Exploration

The Site Analysis page provides an interactive 3D terrain view with natural, elevation, and slope modes, site-specific scientific context, qualitative suitability indicators, and synchronized site selection through URL query parameters. The terrain surface is procedurally generated and clearly labelled as illustrative; it is not a DEM, hazard map, or NASA measurement.

## P03 Sunlight Simulator

The Sunlight Simulator at `/simulator` uses a simplified 29.53-day sinusoidal solar model to move a directional light and Sun indicator across the illustrative terrain. It includes a time slider, play/pause, reset, speed controls, dynamic shadows, qualitative illumination readouts, and a derived relative solar-availability metric. All outputs are illustrative and are not predictions of actual lunar illumination windows or solar power.

## P04 Unified Mission Workspace

The primary experience is now `/workspace`, with `/` redirecting there. A docked mode bar switches between Global Moon, Surface Explorer, Sunlight Lab, and Site Comparison without leaving the workspace. Candidate site, viewing mode, terrain display, simulation time/playback, and panel state are shared; site and mode are also reflected in URL query parameters. The left site panel and right contextual inspector are collapsible and float over a single active 3D viewport. The Sunlight Lab timeline controls the existing P03 simulation through the shared `useSunlightSimulation` hook.

The sidebar now exposes Mission Workspace, Data & Sources, and About NavCosmo. Legacy routes (`/overview`, `/explorer`, `/analysis`, `/simulator`, `/comparison`) remain available as compatibility pages.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Notes

- Candidate sites: Shackleton Crater and Malapert Massif.
- Marker coordinates and analysis values are approximate/illustrative placeholders.
- The mission workspace uses one active 3D canvas at a time to keep the integrated experience responsive on integrated graphics.
- Site terrain remains procedural and illustrative; the solar model remains simplified and relative.
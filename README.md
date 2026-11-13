# NavCosmo

Explore. Analyze. Navigate the Moon.

NavCosmo is an interactive lunar landing-site exploration platform built for NASA Space Apps Challenge 2026. This P01 build provides the application foundation, navigation, candidate-site data model, and an interactive 3D Moon.

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
- The interactive 3D Moon is implemented in P01; detailed terrain analysis and sunlight simulation remain future milestones.
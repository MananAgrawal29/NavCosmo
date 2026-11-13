import type { LunarSite } from '../types/lunarSite'

export const lunarSites: LunarSite[] = [
  {
    id: 'shackleton-crater',
    name: 'Shackleton Crater',
    description:
      'A south-pole crater containing permanently shadowed regions, studied for its cold-trap environment and possible water-ice relevance.',
    latitude: -89.9,
    longitude: 0.0,
    region: 'Lunar south-pole region',
    scientificSignificance:
      'High scientific interest for volatile preservation, permanently shadowed regions, and south-pole resource investigations.',
    advantages: [
      'Strong scientific value for water-ice and volatile studies',
      'Located in a high-priority south-pole exploration zone',
      'Potential access to nearby illuminated rim areas',
    ],
    limitations: [
      'Extreme cold and long-duration shadow create operational challenges',
      'Rugged terrain may complicate landing and surface mobility',
      'Limited direct solar power inside shadowed areas',
    ],
  },
  {
    id: 'malapert-massif',
    name: 'Malapert Massif',
    description:
      'An elevated south-pole massif considered for its illumination potential and possible communications advantages.',
    latitude: -86.0,
    longitude: 0.0,
    region: 'Lunar south-pole region',
    scientificSignificance:
      'Useful for studying long-duration illumination, surface elevation, and south-pole mission logistics.',
    advantages: [
      'Elevated terrain may support longer periods of sunlight',
      'Potential line-of-sight advantages for communication planning',
      'Favorable topography for observing the surrounding south-pole region',
    ],
    limitations: [
      'Steep slopes may increase landing and traverse risk',
      'Surface composition and trafficability remain to be characterized',
      'Illumination benefits must be validated against seasonal Sun angles',
    ],
  },
]

export const getSiteById = (id: string): LunarSite | undefined =>
  lunarSites.find((site) => site.id === id)
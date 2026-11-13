export type SuitabilityStatus =
  | 'Promising'
  | 'Conditional'
  | 'Challenging'
  | 'Requires further data'

export interface SuitabilityIndicator {
  category: string
  status: SuitabilityStatus
  reason: string
}

export interface SiteProfile {
  establishedContext: string[]
  potentialMissionFactors: string[]
  challenges: string[]
  suitability: SuitabilityIndicator[]
}

export const siteProfiles: Record<string, SiteProfile> = {
  'shackleton-crater': {
    establishedContext: [
      'The crater interior contains permanently shadowed regions that can trap volatiles in cold-trap conditions.',
      'The lunar south-pole region is a high-priority target for investigating possible water ice and other volatile deposits.',
      'Nearby rim and surrounding terrain may offer access to illuminated areas, but local lighting depends on topography and Sun angle.',
      'The site offers opportunities to study polar regolith, volatile processes, and lunar geological history.',
    ],
    potentialMissionFactors: [
      'Direct relevance to volatile and water-ice investigations makes this a strong science target.',
      'Nearby illuminated terrain could support power and thermal planning if local conditions are validated.',
      'A south-pole location may reduce traverse distances to other high-priority polar science targets.',
    ],
    challenges: [
      'Long-duration shadow and extreme cold create thermal, power, and operational challenges.',
      'Rugged crater-rim and interior terrain require high-resolution hazard mapping before landing.',
      'Illumination and communication conditions vary strongly with local topography and are not quantified here.',
    ],
    suitability: [
      {
        category: 'Terrain safety',
        status: 'Challenging',
        reason: 'Rugged crater terrain and unresolved landing hazards require detailed stereo imagery and slope mapping.',
      },
      {
        category: 'Solar illumination',
        status: 'Conditional',
        reason: 'The crater interior is shadowed; nearby illuminated terrain is a potential advantage but remains to be quantified.',
      },
      {
        category: 'Communication potential',
        status: 'Requires further data',
        reason: 'Local horizon, Earth visibility, and relay coverage need terrain-aware analysis.',
      },
      {
        category: 'Resource accessibility',
        status: 'Promising',
        reason: 'The site is directly relevant to volatile and cold-trap science, subject to trafficability and sampling constraints.',
      },
      {
        category: 'Scientific value',
        status: 'Promising',
        reason: 'Permanently shadowed regions and potential volatile deposits are high-priority lunar science targets.',
      },
    ],
  },
  'malapert-massif': {
    establishedContext: [
      'Malapert Massif is an elevated terrain feature in the lunar south-pole region.',
      'Elevated terrain can influence local illumination duration and line-of-sight, but conditions must be modeled with real topography and Sun geometry.',
      'The massif is of interest for understanding south-pole geology and for mission-support logistics studies.',
      'Steep slopes and access routes present terrain challenges that require high-resolution mapping.',
    ],
    potentialMissionFactors: [
      'Elevated terrain may support longer illuminated periods, subject to seasonal Sun angles and local horizon effects.',
      'A high vantage point could offer communication line-of-sight advantages for a properly designed relay architecture.',
      'The surrounding south-pole region offers broad geological and operational observation opportunities.',
    ],
    challenges: [
      'Steep slopes may complicate landing and surface traverse.',
      'Surface composition, bearing strength, and trafficability remain to be characterized.',
      'Seasonal illumination and communication benefits must be validated with authentic terrain and orbital data.',
    ],
    suitability: [
      {
        category: 'Terrain safety',
        status: 'Requires further data',
        reason: 'Steep slopes and unverified surface trafficability require high-resolution mapping before landing assessment.',
      },
      {
        category: 'Solar illumination',
        status: 'Promising',
        reason: 'Elevated terrain may extend illumination, but the benefit depends on Sun angle and the local horizon.',
      },
      {
        category: 'Communication potential',
        status: 'Promising',
        reason: 'A high vantage point may improve line-of-sight, contingent on relay architecture and terrain masking.',
      },
      {
        category: 'Resource accessibility',
        status: 'Requires further data',
        reason: 'Proximity to resource-bearing regions and traverse feasibility are not established in this build.',
      },
      {
        category: 'Scientific value',
        status: 'Conditional',
        reason: 'The site is valuable for illumination and geological studies, but targeted measurements are needed.',
      },
    ],
  },
}

export const getSiteProfile = (siteId: string): SiteProfile =>
  siteProfiles[siteId] ?? siteProfiles['shackleton-crater']
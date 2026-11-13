import { Vector3 } from 'three'

export type TerrainMode = 'natural' | 'elevation' | 'slope'

export interface Crater {
  x: number
  z: number
  radius: number
  depth: number
}

export interface TerrainParameters {
  craters: Crater[]
  seed: number
}

function makeCraters(seed: number): Crater[] {
  let state = seed
  const random = () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }

  return Array.from({ length: 12 }, () => ({
    x: (random() - 0.5) * 3.6,
    z: (random() - 0.5) * 3.6,
    radius: 0.18 + random() * 0.5,
    depth: 0.08 + random() * 0.26,
  }))
}

export function getTerrainParameters(siteId: string): TerrainParameters {
  return {
    craters: makeCraters(siteId === 'malapert-massif' ? 23 : 11),
    seed: siteId === 'malapert-massif' ? 2.4 : 0.8,
  }
}

export function terrainHeight(x: number, z: number, parameters: TerrainParameters): number {
  const { craters, seed } = parameters
  let height = 0.08 * Math.sin(x * 1.8 + seed) * Math.cos(z * 1.55 - seed)
  height += 0.025 * Math.sin(x * 6.3 - z * 4.8)

  for (const crater of craters) {
    const distance = Math.hypot(x - crater.x, z - crater.z)
    if (distance >= crater.radius) continue

    const normalized = distance / crater.radius
    height -= crater.depth * (1 - normalized * normalized)
    height += crater.depth * 0.45 * Math.exp(-(((normalized - 0.88) / 0.09) ** 2))
  }

  return height
}

export function terrainNormal(
  x: number,
  z: number,
  parameters: TerrainParameters,
  epsilon = 0.018,
): Vector3 {
  const dx =
    terrainHeight(x + epsilon, z, parameters) - terrainHeight(x - epsilon, z, parameters)
  const dz =
    terrainHeight(x, z + epsilon, parameters) - terrainHeight(x, z - epsilon, parameters)

  return new Vector3(-dx, epsilon * 2, -dz).normalize()
}

/**
 * Illustrative CPU estimate used only for the simulator readout.
 * It accounts for local surface normals and a simple horizon ray test over the
 * procedural terrain. It is not a real illumination or shadow calculation.
 */
export function estimateIlluminatedFraction(
  siteId: string,
  sunDirection: Vector3,
  gridSize = 18,
): number {
  const sun = sunDirection.clone().normalize()
  if (sun.y <= 0) return 0

  const parameters = getTerrainParameters(siteId)
  const horizontal = Math.hypot(sun.x, sun.z)
  let illuminated = 0
  let total = 0

  for (let row = 0; row < gridSize; row += 1) {
    for (let column = 0; column < gridSize; column += 1) {
      const x = -1.8 + (3.6 * (column + 0.5)) / gridSize
      const z = -1.8 + (3.6 * (row + 0.5)) / gridSize
      const height = terrainHeight(x, z, parameters)
      total += 1

      if (terrainNormal(x, z, parameters).dot(sun) <= 0.02) continue

      let shadowed = false
      if (horizontal > 0.01) {
        for (let step = 1; step <= 8; step += 1) {
          const distance = step * 0.07
          const sampleX = x + (sun.x / horizontal) * distance
          const sampleZ = z + (sun.z / horizontal) * distance
          if (Math.abs(sampleX) > 2 || Math.abs(sampleZ) > 2) break

          const rayHeight = height + (sun.y / horizontal) * distance
          if (terrainHeight(sampleX, sampleZ, parameters) > rayHeight + 0.006) {
            shadowed = true
            break
          }
        }
      }

      if (!shadowed) illuminated += 1
    }
  }

  return total > 0 ? illuminated / total : 0
}
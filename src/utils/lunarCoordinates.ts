import { Vector3 } from 'three'

/**
 * Convert selenographic coordinates to a position on a Three.js sphere.
 *
 * Convention used by the NASA SVS equirectangular map and Three's SphereGeometry:
 * - 0° longitude faces +X (the texture's horizontal center)
 * - +90° east faces -Z
 * - +90° north faces +Y
 *
 * Longitude increases eastward and latitude increases northward.
 */
export function latLonToVector3(latitude: number, longitude: number, radius: number): Vector3 {
  const lat = (latitude * Math.PI) / 180
  const lon = (longitude * Math.PI) / 180
  const cosLat = Math.cos(lat)

  return new Vector3(
    radius * cosLat * Math.cos(lon),
    radius * Math.sin(lat),
    -radius * cosLat * Math.sin(lon),
  )
}
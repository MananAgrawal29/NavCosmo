import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { estimateIlluminatedFraction } from '../utils/terrainModel'

export const LUNAR_CYCLE_HOURS = 708.7
export const INITIAL_TIME_FRACTION = 0.18
export const SIMULATION_SPEEDS = [0.5, 1, 2] as const
export type SimulationSpeed = (typeof SIMULATION_SPEEDS)[number]

const illustrationElevation: Record<string, number> = {
  'shackleton-crater': 7,
  'malapert-massif': 15,
}

const azimuthOffset: Record<string, number> = {
  'shackleton-crater': 0,
  'malapert-massif': 0.55,
}

export function useSunlightSimulation(siteId: string) {
  const [timeFraction, setTimeFraction] = useState(INITIAL_TIME_FRACTION)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<SimulationSpeed>(1)

  useEffect(() => {
    if (!playing) return

    const timer = window.setInterval(() => {
      setTimeFraction((previous) => {
        const next = previous + 0.0024 * speed
        return next >= 1 ? 0 : next
      })
    }, 100)

    return () => window.clearInterval(timer)
  }, [playing, speed])

  const simulation = useMemo(() => {
    const phase = timeFraction * Math.PI * 2
    const maxElevation = illustrationElevation[siteId] ?? 8
    const elevationDeg = maxElevation * Math.sin(phase)
    const elevationRad = THREE.MathUtils.degToRad(elevationDeg)
    const azimuthRad = phase + (azimuthOffset[siteId] ?? 0)
    const cosElevation = Math.cos(elevationRad)
    const sunDirection: [number, number, number] = [
      cosElevation * Math.cos(azimuthRad),
      Math.sin(elevationRad),
      cosElevation * Math.sin(azimuthRad),
    ]
    const sunVector = new THREE.Vector3(...sunDirection).normalize()
    const illuminatedFraction = estimateIlluminatedFraction(siteId, sunVector)
    const solarAvailability = Math.max(0, sunDirection[1]) * illuminatedFraction * 100
    const timeHours = timeFraction * LUNAR_CYCLE_HOURS

    return {
      elevationDeg,
      sunDirection,
      illuminatedFraction,
      solarAvailability,
      timeHours,
      illuminationStatus:
        elevationDeg <= 0
          ? 'Sun below horizon'
          : illuminatedFraction >= 0.72
            ? 'Broadly illuminated'
            : illuminatedFraction >= 0.28
              ? 'Partial illumination'
              : 'Mostly shadowed',
      shadowCondition:
        elevationDeg <= 0
          ? 'Night side · no direct sunlight'
          : illuminatedFraction < 0.25
            ? 'Dominant shadow cover'
            : illuminatedFraction < 0.65
              ? 'Mixed light and shadow'
              : 'Limited shadow cover',
    }
  }, [siteId, timeFraction])

  const resetSimulation = () => {
    setPlaying(false)
    setTimeFraction(INITIAL_TIME_FRACTION)
  }

  return {
    timeFraction,
    setTimeFraction,
    playing,
    setPlaying,
    speed,
    setSpeed,
    simulation,
    resetSimulation,
  }
}

export type SunlightSimulation = ReturnType<typeof useSunlightSimulation>['simulation']
import { Pause, Play, RotateCcw } from 'lucide-react'
import {
  LUNAR_CYCLE_HOURS,
  SIMULATION_SPEEDS,
  type SimulationSpeed,
  type SunlightSimulation,
} from '../../hooks/useSunlightSimulation'

interface SimulationTimelineProps {
  timeFraction: number
  setTimeFraction: (value: number) => void
  playing: boolean
  setPlaying: (value: boolean) => void
  speed: SimulationSpeed
  setSpeed: (value: SimulationSpeed) => void
  resetSimulation: () => void
  simulation: SunlightSimulation
  compact?: boolean
}

export default function SimulationTimeline({
  timeFraction,
  setTimeFraction,
  playing,
  setPlaying,
  speed,
  setSpeed,
  resetSimulation,
  simulation,
  compact = false,
}: SimulationTimelineProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted">Simulation timeline</p>
          <p className={`mt-0.5 tabular-nums text-text ${compact ? 'text-lg' : 'text-xl'}`}>
            {simulation.timeHours.toFixed(1)} h
            <span className="ml-2 text-sm text-muted">/ {LUNAR_CYCLE_HOURS} h</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPlaying(!playing)}
            className="inline-flex min-h-11 items-center gap-2 rounded-[2px] bg-accent px-3 py-2 text-sm font-medium text-on-accent transition hover:bg-accent/90"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {playing ? 'Pause' : 'Play'}
          </button>
          <button
            type="button"
            onClick={resetSimulation}
            className="inline-flex min-h-11 items-center gap-2 rounded-[2px] border border-border px-3 py-2 text-sm text-text transition hover:border-border-strong hover:bg-hover"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          <div className="flex items-center gap-1">
            <span className="mr-1 text-xs text-muted">Speed</span>
            {SIMULATION_SPEEDS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSpeed(option)}
                className={`inline-flex min-h-11 items-center rounded-[2px] border px-2 py-1 text-xs transition ${
                  speed === option
                    ? 'border-border-strong bg-hover text-text'
                    : 'border-border text-muted hover:bg-hover hover:text-text'
                }`}
              >
                {option}×
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <input
          type="range"
          min={0}
          max={1000}
          step={1}
          value={Math.round(timeFraction * 1000)}
          onChange={(event) => setTimeFraction(Number(event.target.value) / 1000)}
          aria-label="Simulation time"
          className="w-full cursor-pointer"
          style={{ accentColor: 'var(--color-accent)' }}
        />
        <div className="mt-1 flex justify-between text-xs text-muted">
          <span>Sunrise</span>
          <span>Noon</span>
          <span>Sunset</span>
          <span>Midnight</span>
          <span>Sunrise</span>
        </div>
      </div>
    </div>
  )
}
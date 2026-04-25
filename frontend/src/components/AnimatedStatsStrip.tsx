import { useEffect, useMemo, useRef, useState } from 'react'

type StatSuffix = 'plus' | 'k-plus' | 'days'

interface StatItem {
  id: string
  label: string
  countTo: number
  suffix: StatSuffix
}

interface AnimatedStatsStripProps {
  stats?: StatItem[]
}

const DEFAULT_STATS: StatItem[] = [
  { id: 'books', label: 'Books in library', countTo: 8, suffix: 'k-plus' },
  { id: 'courses', label: 'Online courses', countTo: 300, suffix: 'plus' },
  { id: 'members', label: 'Active members', countTo: 25, suffix: 'k-plus' },
  { id: 'lending', label: 'Lending period', countTo: 14, suffix: 'days' },
]

const DURATION_MS = 1550
function easeOutQuart(progress: number) {
  return 1 - Math.pow(1 - progress, 4)
}

function formatStatValue(value: number, suffix: StatSuffix) {
  if (value === 0) {
    return '0'
  }

  switch (suffix) {
    case 'k-plus':
      return `${value}K+`
    case 'days':
      return `${value}d`
    case 'plus':
    default:
      return `${value}+`
  }
}

function AnimatedStat({
  stat,
  shouldStart,
}: {
  stat: StatItem
  shouldStart: boolean
}) {
  const [value, setValue] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const valueRef = useRef<HTMLDivElement | null>(null)

  const formattedFinalValue = useMemo(
    () => formatStatValue(stat.countTo, stat.suffix),
    [stat.countTo, stat.suffix]
  )

  useEffect(() => {
    if (!shouldStart) {
      return
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reducedMotion) {
      setValue(stat.countTo)
      setIsComplete(true)
      return
    }

    let animationFrameId = 0
    let animationStart = 0

    const step = (timestamp: number) => {
      if (animationStart === 0) {
        animationStart = timestamp
      }

      const elapsed = timestamp - animationStart
      const progress = Math.min(elapsed / DURATION_MS, 1)
      const easedProgress = easeOutQuart(progress)
      const nextValue = Math.round(stat.countTo * easedProgress)

      setValue(previousValue => (previousValue === nextValue ? previousValue : nextValue))

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step)
        return
      }

      setValue(stat.countTo)
      setIsComplete(true)
    }

    animationFrameId = window.requestAnimationFrame(step)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [shouldStart, stat.countTo])

  useEffect(() => {
    if (!isComplete || !valueRef.current) {
      return
    }

    valueRef.current.animate(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(1.06)' },
        { transform: 'scale(1)' },
      ],
      {
        duration: 320,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      }
    )
  }, [isComplete])

  return (
    <div className="number-item">
      <div
        ref={valueRef}
        className="number-val relative inline-grid min-w-[4.5ch] place-items-center tabular-nums"
        aria-label={`${formattedFinalValue} ${stat.label}`}
      >
        <span className="invisible">{formattedFinalValue}</span>
        <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
          {formatStatValue(value, stat.suffix)}
        </span>
      </div>

      <div className="number-lbl">{stat.label}</div>
    </div>
  )
}

export default function AnimatedStatsStrip({
  stats = DEFAULT_STATS,
}: AnimatedStatsStripProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false)

  useEffect(() => {
    const currentSection = sectionRef.current

    if (!currentSection || hasEnteredViewport) {
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0]

        if (!entry?.isIntersecting) {
          return
        }

        setHasEnteredViewport(true)
        observer.disconnect()
      },
      {
        threshold: 0.35,
        rootMargin: '0px 0px -8% 0px',
      }
    )

    observer.observe(currentSection)

    return () => observer.disconnect()
  }, [hasEnteredViewport])

  return (
    <section ref={sectionRef} className="numbers-strip" aria-label="Platform statistics">
      <div className="numbers-inner">
        {stats.map((stat, index) => (
          <AnimatedStat
            key={stat.id}
            stat={stat}
            shouldStart={hasEnteredViewport}
          />
        ))}
      </div>
    </section>
  )
}

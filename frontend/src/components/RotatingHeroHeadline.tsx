import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const DEFAULT_PHRASES = [
  'Read more.',
  'Learn faster.',
  'Grow further.',
  'Build confidently.',
]

const DISPLAY_DURATION_MS = 2200

interface RotatingHeroHeadlineProps {
  phrases?: string[]
  title?: string
  highlight?: string
  description?: string
}

export default function RotatingHeroHeadline({
  phrases = DEFAULT_PHRASES,
  title = 'All-in-One',
  highlight = 'Platform.',
  description = 'Borrow books, enroll in courses, and track everything from one calm, focused workspace.',
}: RotatingHeroHeadlineProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const shouldReduceMotion = useReducedMotion()

  const longestPhrase = useMemo(() => {
    if (phrases.length === 0) {
      return ''
    }

    return phrases.reduce((longest, current) => (current.length > longest.length ? current : longest))
  }, [phrases])

  useEffect(() => {
    if (phrases.length <= 1) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setActiveIndex(current => (current + 1) % phrases.length)
    }, DISPLAY_DURATION_MS)

    return () => window.clearTimeout(timeoutId)
  }, [activeIndex, phrases])

  const activePhrase = phrases[activeIndex] ?? ''

  return (
    <div className="flex max-w-[42rem] flex-col items-center text-center lg:items-start lg:text-left">
      <div className="mb-4 sm:mb-5">
        <div
          className="relative inline-grid min-h-[3rem] items-end overflow-hidden sm:min-h-[3.75rem] lg:min-h-[4.1rem]"
          aria-live="polite"
          aria-atomic="true"
        >
          <span
            className="invisible block text-[1.85rem] font-semibold leading-none tracking-[-0.05em] sm:text-[2.5rem] lg:text-[3rem]"
            style={{ color: 'var(--text-secondary)' }}
          >
            {longestPhrase}
          </span>

          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={activePhrase}
              className="absolute inset-0 block text-[1.85rem] font-semibold leading-none tracking-[-0.05em] sm:text-[2.5rem] lg:text-[3rem]"
              style={{ color: 'var(--text-secondary)' }}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 26 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -26 }}
              transition={{
                duration: shouldReduceMotion ? 0.2 : 0.58,
                ease: [0.42, 0, 0.58, 1],
                delay: shouldReduceMotion ? 0 : 0.08,
              }}
            >
              {activePhrase}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <h1
        className="max-w-[11ch] text-[clamp(2.85rem,8vw,5rem)] font-bold leading-[0.97] tracking-[-0.065em]"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}{' '}
        <span style={{ color: '#2563eb' }}>
          {highlight}
        </span>
      </h1>

      <p
        className="mt-6 max-w-[36rem] text-base leading-8 sm:text-lg"
        style={{ color: 'var(--text-muted)' }}
      >
        {description}
      </p>
    </div>
  )
}

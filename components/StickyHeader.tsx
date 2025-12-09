'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useTimer } from '@/lib/timer-context'
import HeroTimer from './HeroTimer'

interface StickyHeaderProps {
  isVisible: boolean
  signalMinutes: number
  onPauseResume: () => void
  onStop: () => void
}

export default function StickyHeader({ isVisible, signalMinutes, onPauseResume, onStop }: StickyHeaderProps) {
  const { isRunning, isPaused } = useTimer()

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-0 left-0 right-0 z-40 bg-black border-b-2 border-neutral h-16 flex items-center justify-between px-8"
        >
          {/* Logo - Left */}
          <div className="text-white text-xl font-bold tracking-tight">
            SIGNAL
          </div>

          {/* Version - Right */}
          <div className="text-neutral text-xs tracking-widest">
            v0.1
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


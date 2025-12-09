'use client'

import { motion } from 'framer-motion'
import { useTimer } from '@/lib/timer-context'
import { formatDuration } from '@/lib/parser'

interface HeroTimerProps {
  signalMinutes: number
  isCompact?: boolean
}

export default function HeroTimer({ signalMinutes, isCompact = false }: HeroTimerProps) {
  const { isRunning, formattedTime } = useTimer()
  
  // Use timer context time if running, otherwise use signal minutes
  const displayTime = isRunning ? formattedTime : formatDuration(signalMinutes)
  
  if (isCompact) {
    // Compact version for sticky header (no seconds)
    const timeWithoutSeconds = displayTime.split(':').slice(0, 2).join(':')
    return (
      <div className="text-signal text-2xl font-bold tracking-tight">
        {timeWithoutSeconds}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Hero timer - huge and centered */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative"
      >
        <motion.div
          animate={isRunning ? {
            textShadow: [
              '0 0 20px rgba(14, 165, 233, 0.3)',
              '0 0 40px rgba(14, 165, 233, 0.5)',
              '0 0 20px rgba(14, 165, 233, 0.3)',
            ],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="text-signal font-bold tracking-tight text-center"
          style={{
            fontSize: 'clamp(96px, 15vw, 144px)',
            lineHeight: '1',
          }}
        >
          {displayTime}
        </motion.div>
      </motion.div>
      
      {/* Label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="text-neutral text-xs tracking-widest mt-4"
      >
        {isRunning ? 'TRACKING TIME' : 'TOTAL SIGNAL TIME'}
      </motion.div>
    </div>
  )
}


'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { formatDuration } from '@/lib/parser'

interface SignalTimerProps {
  signalMinutes: number
  wastedMinutes?: number
}

export default function SignalTimer({ signalMinutes, wastedMinutes = 0 }: SignalTimerProps) {
  const formattedSignal = formatDuration(signalMinutes)
  const formattedWasted = formatDuration(wastedMinutes)

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-8">
      {/* Main Signal Timer */}
      <div className="flex flex-col items-center space-y-3">
        <div className="text-neutral text-sm tracking-widest">
          HIGH SIGNAL TIME
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={signalMinutes}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="text-signal font-bold tracking-tight"
            style={{ fontSize: '84px', lineHeight: '1' }}
          >
            {formattedSignal}
          </motion.div>
        </AnimatePresence>
        
        <div className="text-neutral text-xs tracking-wide">
          HOURS:MINUTES
        </div>
      </div>

      {/* Wasted Time (Secondary) */}
      {wastedMinutes > 0 && (
        <div className="flex flex-col items-center space-y-2 opacity-60">
          <div className="text-neutral text-xs tracking-widest">
            WASTED TIME
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={wastedMinutes}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-wasted font-medium tracking-tight"
              style={{ fontSize: '36px', lineHeight: '1' }}
            >
              {formattedWasted}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Ratio */}
      {signalMinutes > 0 && wastedMinutes > 0 && (
        <div className="flex items-center gap-4 text-neutral text-sm">
          <div className="h-px w-16 bg-neutral"></div>
          <div className="tracking-wide">
            RATIO: {(signalMinutes / wastedMinutes).toFixed(2)}:1
          </div>
          <div className="h-px w-16 bg-neutral"></div>
        </div>
      )}
    </div>
  )
}


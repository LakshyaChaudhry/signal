'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface FloatingActionButtonsProps {
  isVisible: boolean
  isTimerRunning: boolean
  isTimerPaused: boolean
  onStartFocus: () => void
  onPauseResume: () => void
  onAddLog: () => void
  onTogglePIP?: () => void
}

export default function FloatingActionButtons({
  isVisible,
  isTimerRunning,
  isTimerPaused,
  onStartFocus,
  onPauseResume,
  onAddLog,
  onTogglePIP,
}: FloatingActionButtonsProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Left Button - START FOCUS / PAUSE / RESUME with PIP option */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-8 left-8 z-30"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isTimerRunning ? onPauseResume : onStartFocus}
              className={`px-8 py-4 border-2 text-sm tracking-wide font-medium transition-all duration-150 ${
                isTimerRunning
                  ? 'bg-focused text-black border-focused hover:bg-transparent hover:text-focused'
                  : 'bg-signal text-black border-signal hover:bg-transparent hover:text-signal'
              }`}
            >
              {isTimerRunning ? (isTimerPaused ? '▶ RESUME' : '⏸ PAUSE') : 'START FOCUS'}
            </motion.button>
            
            {/* PIP Toggle (when timer is running) */}
            {isTimerRunning && onTogglePIP && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={onTogglePIP}
                className="mt-2 w-full px-4 py-2 border border-neutral text-neutral hover:text-white hover:border-white transition-colors text-xs tracking-wide"
              >
                ⬇ PIP MODE
              </motion.button>
            )}
          </motion.div>

          {/* Right Button - ADD LOG */}
          <motion.button
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddLog}
            className="fixed bottom-8 right-44 z-30 px-8 py-4 bg-transparent border-2 border-neutral text-neutral hover:bg-white hover:border-signal hover:text-black transition-all duration-150 text-sm tracking-wide font-medium"
          >
            + ADD LOG
          </motion.button>
        </>
      )}
    </AnimatePresence>
  )
}


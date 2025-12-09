'use client'

import { motion } from 'framer-motion'

interface HeroActionsProps {
  onStartFocus: () => void
  onAddLog: () => void
  onPauseResume: () => void
  isTimerRunning: boolean
  isTimerPaused: boolean
}

export default function HeroActions({ onStartFocus, onAddLog, onPauseResume, isTimerRunning, isTimerPaused }: HeroActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="flex items-center justify-center gap-4 w-full max-w-2xl px-4"
    >
      {/* Start Focus Button (when timer not running) */}
      {!isTimerRunning && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartFocus}
          className="flex-1 max-w-xs px-8 py-4 bg-signal text-black border-2 border-signal hover:bg-transparent hover:text-signal hover:border-signal transition-all duration-150 text-sm tracking-wide font-medium"
        >
          START FOCUS
        </motion.button>
      )}
      
      {/* Pause/Resume Button (when timer running) */}
      {isTimerRunning && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPauseResume}
          className="flex-1 max-w-xs px-8 py-4 bg-focused text-black border-2 border-focused hover:bg-transparent hover:text-focused hover:border-focused transition-all duration-150 text-sm tracking-wide font-medium"
        >
          {isTimerPaused ? '▶ RESUME' : '⏸ PAUSE'}
        </motion.button>
      )}
      
      {/* Add Log Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onAddLog}
        className="flex-1 max-w-xs px-8 py-4 bg-transparent border-2 border-neutral text-neutral hover:bg-white hover:border-signal hover:text-black transition-all duration-150 text-sm tracking-wide font-medium"
      >
        ADD LOG
      </motion.button>
    </motion.div>
  )
}


'use client'

import { motion } from 'framer-motion'

interface HeroActionsProps {
  onStartFocus: () => void
  onAddLog: () => void
  isTimerRunning: boolean
}

export default function HeroActions({ onStartFocus, onAddLog, isTimerRunning }: HeroActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="flex items-center justify-center gap-4 w-full max-w-2xl px-4"
    >
      {/* Start Focus Button */}
      {!isTimerRunning && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartFocus}
          className="flex-1 max-w-xs px-8 py-4 bg-signal text-black border-2 border-signal hover:bg-transparent hover:text-signal transition-colors duration-150 text-sm tracking-wide font-medium"
        >
          START FOCUS
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
        className={`flex-1 max-w-xs px-8 py-4 border-2 border-neutral text-neutral hover:border-white hover:text-white transition-colors duration-150 text-sm tracking-wide font-medium ${
          isTimerRunning ? '' : ''
        }`}
      >
        ADD LOG
      </motion.button>
    </motion.div>
  )
}


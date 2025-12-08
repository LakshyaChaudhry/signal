'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTimer } from '@/lib/timer-context'

interface LiveTimerProps {
  onStart: () => Promise<void>
  onStop: () => Promise<void>
  onTogglePIP: () => void
  isPIPVisible: boolean
}

export default function LiveTimer({ onStart, onStop, onTogglePIP, isPIPVisible }: LiveTimerProps) {
  const { isRunning, isPaused, formattedTime, pauseTimer, resumeTimer } = useTimer()
  const [isStarting, setIsStarting] = useState(false)
  const [isStopping, setIsStopping] = useState(false)

  const handleStart = async () => {
    setIsStarting(true)
    try {
      await onStart()
    } catch (error) {
      console.error('Failed to start timer:', error)
    } finally {
      setIsStarting(false)
    }
  }

  const handleStop = async () => {
    setIsStopping(true)
    try {
      await onStop()
    } catch (error) {
      console.error('Failed to stop timer:', error)
    } finally {
      setIsStopping(false)
    }
  }

  // If timer is not running, show the START button
  if (!isRunning) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleStart}
        disabled={isStarting}
        className="fixed bottom-8 left-8 px-8 py-4 bg-deep text-black border-2 border-deep hover:bg-transparent hover:text-deep transition-colors duration-150 text-sm tracking-wide font-medium shadow-xl disabled:opacity-50"
      >
        {isStarting ? 'STARTING...' : '▶ START TIMER'}
      </motion.button>
    )
  }

  // If timer is running, show expanded controls
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-8 left-8 border-2 border-deep bg-black p-6 space-y-4 shadow-xl"
      style={{ minWidth: '280px' }}
    >
      {/* Timer Display */}
      <div className="flex flex-col items-center space-y-2">
        <div className="text-neutral text-xs tracking-widest">
          {isPaused ? 'PAUSED' : 'TRACKING TIME'}
        </div>
        
        <div className="text-deep text-4xl font-bold tracking-tight">
          {formattedTime}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {/* Pause/Resume Button */}
        <button
          onClick={isPaused ? resumeTimer : pauseTimer}
          className="flex-1 px-4 py-2 border-2 border-focused text-focused hover:bg-focused hover:text-black transition-colors duration-150 text-xs tracking-wide"
        >
          {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
        </button>

        {/* Stop Button */}
        <button
          onClick={handleStop}
          disabled={isStopping}
          className="flex-1 px-4 py-2 border-2 border-white text-white hover:bg-white hover:text-black transition-colors duration-150 text-xs tracking-wide disabled:opacity-50"
        >
          {isStopping ? 'STOPPING...' : '⏹ STOP'}
        </button>
      </div>

      {/* PIP Toggle */}
      <button
        onClick={onTogglePIP}
        className="w-full px-4 py-2 border border-neutral text-neutral hover:text-white hover:border-white transition-colors duration-150 text-xs tracking-wide"
      >
        {isPIPVisible ? '⬆ MAXIMIZE' : '⬇ MINIMIZE TO PIP'}
      </button>
    </motion.div>
  )
}


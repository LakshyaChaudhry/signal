'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Day {
  id: string
  wakeTime: string
  sleepTime: string | null
}

interface DayStatusBarProps {
  currentDay: Day | null
  onPreviousDay: () => void
  onNextDay: () => void
  onUpdateWakeTime: (newTime: string) => void
  hasPrevious: boolean
  hasNext: boolean
}

export default function DayStatusBar({ currentDay, onPreviousDay, onNextDay, onUpdateWakeTime, hasPrevious, hasNext }: DayStatusBarProps) {
  const [isEditingWakeTime, setIsEditingWakeTime] = useState(false)
  const [tempWakeTime, setTempWakeTime] = useState('')

  if (!currentDay) return null

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const wakeTime = new Date(currentDay.wakeTime)
  const sleepTime = currentDay.sleepTime ? new Date(currentDay.sleepTime) : null
  const isToday = !currentDay.sleepTime

  const handleEditWakeTime = () => {
    // BUG FIX: Convert UTC to local time for datetime-local input
    // datetime-local expects format: YYYY-MM-DDTHH:mm in LOCAL timezone
    const year = wakeTime.getFullYear()
    const month = String(wakeTime.getMonth() + 1).padStart(2, '0')
    const day = String(wakeTime.getDate()).padStart(2, '0')
    const hours = String(wakeTime.getHours()).padStart(2, '0')
    const minutes = String(wakeTime.getMinutes()).padStart(2, '0')
    const formatted = `${year}-${month}-${day}T${hours}:${minutes}`
    
    setTempWakeTime(formatted)
    setIsEditingWakeTime(true)
  }

  const handleSaveWakeTime = () => {
    if (tempWakeTime) {
      // Validate: wake time cannot be in the future
      const wakeDate = new Date(tempWakeTime)
      const now = new Date()
      if (wakeDate > now) {
        alert('Cannot set wake time in the future')
        return
      }
      
      // BUG FIX: datetime-local gives us local time string, convert to UTC ISO
      // Create Date from local time string (browser interprets as local)
      // Then convert to ISO string for storage (converts to UTC)
      onUpdateWakeTime(new Date(tempWakeTime).toISOString())
    }
    setIsEditingWakeTime(false)
  }

  const handleCancelEdit = () => {
    setIsEditingWakeTime(false)
    setTempWakeTime('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full h-8 flex items-center justify-between px-8 border-b border-neutral bg-black"
    >
      {/* Previous Day Button */}
      <button
        onClick={onPreviousDay}
        disabled={!hasPrevious}
        className="text-neutral hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
      >
        ← PREV
      </button>
      
      {/* Day Info */}
      <div className="flex items-center gap-3 text-xs tracking-wide">
        <span className={isToday ? 'text-signal' : 'text-white'}>
          {isToday ? 'TODAY' : wakeTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        <span className="text-neutral">•</span>
        
        {/* Editable Wake Time */}
        {isEditingWakeTime ? (
          <div className="flex items-center gap-2">
            <input
              type="datetime-local"
              value={tempWakeTime}
              onChange={(e) => setTempWakeTime(e.target.value)}
              className="bg-black text-white text-xs border border-signal px-2 py-1"
              autoFocus
            />
            <button onClick={handleSaveWakeTime} className="text-signal hover:text-white">
              ✓
            </button>
            <button onClick={handleCancelEdit} className="text-neutral hover:text-white">
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={handleEditWakeTime}
            className="text-neutral hover:text-white transition-colors cursor-pointer"
          >
            {formatTime(wakeTime)} ✎
          </button>
        )}
        
        <span className="text-neutral">→</span>
        <span className="text-neutral">
          {sleepTime ? formatTime(sleepTime) : 'ONGOING'}
        </span>
      </div>
      
      {/* Next Day Button */}
      <button
        onClick={onNextDay}
        disabled={!hasNext}
        className="text-neutral hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
      >
        NEXT →
      </button>
    </motion.div>
  )
}


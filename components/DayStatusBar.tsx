'use client'

import { motion } from 'framer-motion'

interface Day {
  id: string
  wakeTime: string
  sleepTime: string | null
}

interface DayStatusBarProps {
  currentDay: Day | null
}

export default function DayStatusBar({ currentDay }: DayStatusBarProps) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full h-8 flex items-center justify-center border-b border-neutral bg-black"
    >
      <div className="flex items-center gap-3 text-xs tracking-wide">
        <span className={isToday ? 'text-signal' : 'text-white'}>
          {isToday ? 'TODAY' : wakeTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        <span className="text-neutral">•</span>
        <span className="text-neutral">
          {formatTime(wakeTime)}
        </span>
        <span className="text-neutral">→</span>
        <span className="text-neutral">
          {sleepTime ? formatTime(sleepTime) : 'ONGOING'}
        </span>
      </div>
    </motion.div>
  )
}


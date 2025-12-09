'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface LogEntry {
  id: string
  timestamp: string
  duration: number | null
  quality?: string | null
  type: string
}

interface DailyProgressBarProps {
  wakeTime: string
  sleepTime?: string | null
  entries: LogEntry[]
}

export default function DailyProgressBar({ wakeTime, sleepTime, entries }: DailyProgressBarProps) {
  const progressBlocks = useMemo(() => {
    const wake = new Date(wakeTime)
    const sleep = sleepTime ? new Date(sleepTime) : new Date()
    const totalMinutes = Math.floor((sleep.getTime() - wake.getTime()) / (1000 * 60))
    
    if (totalMinutes <= 0) return []
    
    // Create blocks from entries with duration
    return entries
      .filter(entry => entry.duration && entry.duration > 0 && entry.type !== 'wake')
      .map(entry => {
        const entryTime = new Date(entry.timestamp)
        const minutesFromWake = Math.floor((entryTime.getTime() - wake.getTime()) / (1000 * 60))
        
        // Determine color based on quality or type
        let colorClass = 'bg-neutral'
        if (entry.quality) {
          switch (entry.quality) {
            case 'deep':
              colorClass = 'bg-deep'
              break
            case 'focused':
              colorClass = 'bg-focused'
              break
            case 'neutral':
              colorClass = 'bg-medium'
              break
            case 'distracted':
              colorClass = 'bg-distracted'
              break
            case 'wasted':
              colorClass = 'bg-lost'
              break
          }
        } else if (entry.type === 'signal') {
          colorClass = 'bg-signal'
        } else if (entry.type === 'wasted') {
          colorClass = 'bg-wasted'
        }
        
        return {
          id: entry.id,
          start: (minutesFromWake / totalMinutes) * 100,
          width: ((entry.duration || 0) / totalMinutes) * 100,
          color: colorClass,
        }
      })
  }, [wakeTime, sleepTime, entries])
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const wake = new Date(wakeTime)
  const sleep = sleepTime ? new Date(sleepTime) : null

  if (!wakeTime) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="w-full max-w-4xl px-4"
    >
      {/* Time labels */}
      <div className="flex justify-between text-neutral text-xs mb-2">
        <span>{formatTime(wake)}</span>
        <span>{sleep ? formatTime(sleep) : 'NOW'}</span>
      </div>
      
      {/* Progress bar */}
      <div className="relative h-10 bg-neutral bg-opacity-10 border-2 border-neutral overflow-hidden">
        {progressBlocks.map((block, index) => (
          <motion.div
            key={block.id}
            initial={{ width: 0, opacity: 0 }}
            animate={{ 
              width: `${block.width}%`,
              opacity: 1 
            }}
            transition={{ 
              duration: 0.3,
              delay: 0.5 + (index * 0.05),
              ease: 'easeOut'
            }}
            className={`absolute h-full ${block.color}`}
            style={{ left: `${block.start}%` }}
          />
        ))}
      </div>
    </motion.div>
  )
}


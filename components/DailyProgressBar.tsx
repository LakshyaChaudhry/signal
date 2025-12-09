'use client'

import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'

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
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null)
  
  const getStripeBackground = (pattern: string) => {
    // Create diagonal stripe patterns using CSS repeating-linear-gradient
    switch (pattern) {
      case 'deep':
        return 'repeating-linear-gradient(45deg, transparent, transparent 2px, #0EA5E9 2px, #0EA5E9 4px)'
      case 'focused':
        return 'repeating-linear-gradient(45deg, transparent, transparent 2px, #06B6D4 2px, #06B6D4 4px)'
      case 'neutral':
        return 'repeating-linear-gradient(45deg, transparent, transparent 3px, #808080 3px, #808080 5px)'
      case 'distracted':
        return 'repeating-linear-gradient(-45deg, transparent, transparent 2px, #F59E0B 2px, #F59E0B 4px)'
      case 'wasted':
        return 'repeating-linear-gradient(-45deg, transparent, transparent 1px, #EF4444 1px, #EF4444 3px)'
      default:
        return 'repeating-linear-gradient(45deg, transparent, transparent 3px, #808080 3px, #808080 5px)'
    }
  }
  
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
        
        // Determine pattern based on quality or type
        let patternId = 'neutral'
        if (entry.quality) {
          patternId = entry.quality
        } else if (entry.type === 'signal') {
          patternId = 'deep'
        } else if (entry.type === 'wasted') {
          patternId = 'wasted'
        }
        
        return {
          id: entry.id,
          start: (minutesFromWake / totalMinutes) * 100,
          width: ((entry.duration || 0) / totalMinutes) * 100,
          pattern: patternId,
          quality: entry.quality || entry.type,
          duration: entry.duration || 0,
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
      
      {/* Progress bar with diagonal stripe patterns */}
      <div className="relative h-10 bg-transparent border border-neutral overflow-hidden">
        {progressBlocks.map((block, index) => (
          <motion.div
            key={block.id}
            initial={{ width: 0, opacity: 0 }}
            animate={{ 
              width: `${block.width}%`,
              opacity: hoveredBlock === block.id ? 0.9 : 0.6
            }}
            transition={{ 
              duration: 0.3,
              delay: 0.5 + (index * 0.05),
              ease: 'easeOut'
            }}
            className="absolute h-full cursor-pointer transition-opacity"
            style={{ 
              left: `${block.start}%`,
              background: getStripeBackground(block.pattern),
            }}
            onMouseEnter={() => setHoveredBlock(block.id)}
            onMouseLeave={() => setHoveredBlock(null)}
          >
            {/* Hover tooltip */}
            {hoveredBlock === block.id && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black border border-white text-white text-[10px] whitespace-nowrap z-20"
              >
                {block.quality?.toUpperCase()} • {block.duration}min
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { LogEntry, TimelineBlock } from '@/types'

interface TimelineViewProps {
  wakeTime: string
  sleepTime?: string | null
  entries: LogEntry[]
}

export default function TimelineView({ wakeTime, sleepTime, entries }: TimelineViewProps) {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)

  // Calculate timeline parameters
  const wake = new Date(wakeTime)
  const sleep = sleepTime ? new Date(sleepTime) : new Date()
  const totalMinutes = Math.floor((sleep.getTime() - wake.getTime()) / (1000 * 60))
  
  // Create timeline blocks from entries
  const blocks: TimelineBlock[] = entries
    .filter(entry => entry.type !== 'wake' && entry.duration && entry.duration > 0)
    .map(entry => {
      const entryTime = new Date(entry.timestamp)
      const minutesFromWake = Math.floor((entryTime.getTime() - wake.getTime()) / (1000 * 60))
      
      return {
        id: entry.id,
        startMinute: minutesFromWake,
        durationMinutes: entry.duration || 0,
        type: entry.type,
        quality: entry.quality,
        content: entry.content,
        timestamp: entry.timestamp,
      }
    })

  // Generate time labels (every 2 hours)
  const timeLabels = []
  for (let i = 0; i <= totalMinutes; i += 120) {
    const labelTime = new Date(wake.getTime() + i * 60 * 1000)
    timeLabels.push({
      minute: i,
      label: labelTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
    })
  }

  // Unified color mapping for quality and type
  const getColorClasses = (type: string, quality?: string | null) => {
    const colorMap: Record<string, { bg: string; border: string; text: string }> = {
      deep: { bg: 'bg-deep', border: 'border-deep', text: 'text-deep' },
      focused: { bg: 'bg-focused', border: 'border-focused', text: 'text-focused' },
      neutral: { bg: 'bg-medium', border: 'border-medium', text: 'text-medium' },
      distracted: { bg: 'bg-distracted', border: 'border-distracted', text: 'text-distracted' },
      wasted: { bg: 'bg-lost', border: 'border-lost', text: 'text-lost' },
      signal: { bg: 'bg-signal', border: 'border-signal', text: 'text-signal' },
    }
    const key = quality || type
    return colorMap[key] || { bg: 'bg-neutral', border: 'border-neutral', text: 'text-neutral' }
  }

  const getBlockPosition = (startMinute: number) => {
    return (startMinute / totalMinutes) * 100
  }

  const getBlockWidth = (durationMinutes: number) => {
    return (durationMinutes / totalMinutes) * 100
  }

  if (totalMinutes <= 0) {
    return (
      <div className="py-12">
        <div className="text-neutral text-center text-sm">
          Timeline will appear once you log your first entry
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 space-y-6">
      <div className="text-neutral text-sm tracking-widest text-center">
        TIMELINE
      </div>

      {/* Time labels */}
      <div className="relative h-8">
        {timeLabels.map(({ minute, label }) => (
          <div
            key={minute}
            className="absolute text-neutral text-xs"
            style={{ left: `${getBlockPosition(minute)}%` }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Timeline bar */}
      <div className="relative">
        {/* Background bar */}
        <div className="h-20 bg-neutral bg-opacity-10 border-2 border-neutral relative overflow-hidden">
          {/* Time blocks */}
          {blocks.map((block, index) => (
            <motion.div
              key={block.id}
              initial={{ width: 0, opacity: 0 }}
              animate={{ 
                width: `${getBlockWidth(block.durationMinutes)}%`,
                opacity: 1 
              }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.05,
                ease: 'easeOut' 
              }}
              className={`absolute h-full ${getColorClasses(block.type, block.quality).bg} cursor-pointer hover:opacity-80 transition-opacity`}
              style={{ left: `${getBlockPosition(block.startMinute)}%` }}
              onClick={() => setSelectedBlock(selectedBlock === block.id ? null : block.id)}
            >
              {/* Duration label (if block is wide enough) */}
              {block.durationMinutes >= 30 && (
                <div className="flex items-center justify-center h-full text-black text-xs font-medium">
                  {Math.round(block.durationMinutes)}m
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Wake/Sleep markers */}
        <div className="absolute -top-8 left-0 text-xs text-signal">
          ↑ WAKE
        </div>
        {sleepTime && (
          <div className="absolute -top-8 right-0 text-xs text-neutral">
            SLEEP ↑
          </div>
        )}
      </div>

      {/* Selected block details */}
      {selectedBlock && blocks.filter(b => b.id === selectedBlock).map(block => (
        <motion.div
          key={block.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border-2 ${getColorClasses(block.type, block.quality).border} p-6 space-y-2`}
        >
          <div className="space-y-2">
            <div className={`text-sm tracking-wide ${getColorClasses(block.type, block.quality).text}`}>
              {block.quality ? block.quality.toUpperCase() : block.type.toUpperCase()} • {block.durationMinutes} MINUTES
            </div>
            <div className="text-white text-base">
              {block.content}
            </div>
            <div className="text-neutral text-xs">
              {new Date(block.timestamp).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </div>
          </div>
        </motion.div>
      ))}

      {/* Legend */}
      <div className="flex justify-center gap-4 text-xs flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-deep"></div>
          <span className="text-neutral">DEEP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-focused"></div>
          <span className="text-neutral">FOCUSED</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-medium"></div>
          <span className="text-neutral">NEUTRAL</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-distracted"></div>
          <span className="text-neutral">DISTRACTED</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-lost"></div>
          <span className="text-neutral">WASTED</span>
        </div>
      </div>
    </div>
  )
}


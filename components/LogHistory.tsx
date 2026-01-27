'use client'

import { motion } from 'framer-motion'
import { LogEntry } from '@/types'

interface LogHistoryProps {
  entries: LogEntry[]
  onDeleteEntry?: (entryId: string) => void
  onEditEntry?: (entry: LogEntry) => void
}

export default function LogHistory({ entries, onDeleteEntry, onEditEntry }: LogHistoryProps) {
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'deep':
        return 'text-deep border-deep'
      case 'focused':
        return 'text-focused border-focused'
      case 'neutral':
        return 'text-medium border-medium'
      case 'distracted':
        return 'text-distracted border-distracted'
      case 'wasted':
        return 'text-lost border-lost'
      default:
        return 'text-neutral border-neutral'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'signal':
        return 'text-signal border-signal'
      case 'wasted':
        return 'text-wasted border-wasted'
      case 'wake':
        return 'text-signal border-signal'
      case 'sleep':
        return 'text-neutral border-neutral'
      default:
        return 'text-neutral border-neutral'
    }
  }

  const getTypeLabel = (type: string, quality?: string | null) => {
    if (quality) {
      return quality.toUpperCase()
    }
    return type.toUpperCase()
  }

  if (entries.length === 0) {
    return (
      <div className="py-12">
        <div className="text-neutral text-center text-sm">
          No entries yet. Click &quot;New Log Entry&quot; to get started.
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 space-y-6">
      <div className="text-neutral text-sm tracking-widest text-center">
        LOG HISTORY
      </div>

      <div className="space-y-4">
        {entries.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
            className="border-2 border-neutral hover:border-white transition-colors duration-150 p-6 group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                {/* Quality/Type Badge and Duration */}
                <div className="flex items-center gap-3 text-xs">
                  <span 
                    className={`tracking-wide px-2 py-1 border ${
                      entry.quality 
                        ? getQualityColor(entry.quality) 
                        : getTypeColor(entry.type)
                    }`}
                  >
                    {getTypeLabel(entry.type, entry.quality)}
                  </span>
                  {entry.duration && (
                    <>
                      <span className="text-neutral">•</span>
                      <span className="text-neutral">
                        {entry.duration} MINUTES
                      </span>
                    </>
                  )}
                </div>

                {/* Content */}
                <div className="text-white text-base leading-relaxed">
                  {entry.content}
                </div>

                {/* Timestamp */}
                <div className="text-neutral text-xs">
                  {new Date(entry.timestamp).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </div>
              </div>

              {/* Edit and Delete buttons (appear on hover) */}
              <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity duration-150">
                {onEditEntry && (
                  <button
                    onClick={() => onEditEntry(entry)}
                    className="text-neutral hover:text-white text-xs tracking-wide px-3 py-1 border border-neutral hover:border-white"
                    title="Edit entry"
                  >
                    EDIT
                  </button>
                )}
                {onDeleteEntry && (
                  <button
                    onClick={() => onDeleteEntry(entry.id)}
                    className="text-neutral hover:text-white text-xs tracking-wide px-3 py-1 border border-neutral hover:border-white"
                    title="Delete entry"
                  >
                    DELETE
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}


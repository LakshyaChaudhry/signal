'use client'

import { motion } from 'framer-motion'

interface LogEntry {
  id: string
  timestamp: string
  content: string
  type: string
  duration: number | null
}

interface LogHistoryProps {
  entries: LogEntry[]
  onDeleteEntry?: (entryId: string) => void
}

export default function LogHistory({ entries, onDeleteEntry }: LogHistoryProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'signal':
        return 'text-signal'
      case 'wasted':
        return 'text-wasted'
      case 'wake':
        return 'text-signal'
      case 'sleep':
        return 'text-neutral'
      default:
        return 'text-neutral'
    }
  }

  const getTypeLabel = (type: string) => {
    return type.toUpperCase()
  }

  if (entries.length === 0) {
    return (
      <div className="py-12">
        <div className="text-neutral text-center text-sm">
          No entries yet. Click "New Log Entry" to get started.
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
                {/* Type and Duration */}
                <div className="flex items-center gap-3 text-xs">
                  <span className={`tracking-wide ${getTypeColor(entry.type)}`}>
                    {getTypeLabel(entry.type)}
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

              {/* Delete button (appears on hover) */}
              {onDeleteEntry && (
                <button
                  onClick={() => onDeleteEntry(entry.id)}
                  className="opacity-0 group-hover:opacity-100 text-neutral hover:text-white transition-opacity duration-150 text-xs tracking-wide px-3 py-1 border border-neutral hover:border-white"
                  title="Delete entry"
                >
                  DELETE
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}


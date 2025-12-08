'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { containsWakeKeywords, containsSleepKeywords } from '@/lib/parser'

interface LogInputProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    content: string
    quality?: string
    timestamp?: string
    duration?: number
    shouldPromptWake?: boolean
    shouldPromptSleep?: boolean
  }) => void
  prefillData?: {
    content?: string
    quality?: string
    duration?: number
    timestamp?: string
  }
}

const QUALITY_LEVELS = [
  { value: 'deep', label: 'Deep Work', color: 'text-deep', bgColor: 'bg-deep' },
  { value: 'focused', label: 'Focused', color: 'text-focused', bgColor: 'bg-focused' },
  { value: 'neutral', label: 'Neutral', color: 'text-medium', bgColor: 'bg-medium' },
  { value: 'distracted', label: 'Distracted', color: 'text-distracted', bgColor: 'bg-distracted' },
  { value: 'wasted', label: 'Wasted', color: 'text-lost', bgColor: 'bg-lost' },
]

export default function LogInput({ isOpen, onClose, onSubmit, prefillData }: LogInputProps) {
  const [content, setContent] = useState('')
  const [quality, setQuality] = useState<string>('')
  const [timestamp, setTimestamp] = useState('')
  const [duration, setDuration] = useState('')
  const [useCustomTime, setUseCustomTime] = useState(false)
  const [useManualDuration, setUseManualDuration] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Prefill data when component opens
  useEffect(() => {
    if (isOpen) {
      if (prefillData) {
        setContent(prefillData.content || '')
        setQuality(prefillData.quality || '')
        if (prefillData.duration) {
          setDuration(prefillData.duration.toString())
          setUseManualDuration(true)
        }
        if (prefillData.timestamp) {
          const date = new Date(prefillData.timestamp)
          const formatted = date.toISOString().slice(0, 16)
          setTimestamp(formatted)
          setUseCustomTime(true)
        }
      }
      
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }
  }, [isOpen, prefillData])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const handleClose = () => {
    setContent('')
    setQuality('')
    setTimestamp('')
    setDuration('')
    setUseCustomTime(false)
    setUseManualDuration(false)
    onClose()
  }

  const handleSubmit = () => {
    if (!content.trim()) return

    const hasWake = containsWakeKeywords(content)
    const hasSleep = containsSleepKeywords(content)

    const data: any = {
      content: content.trim(),
      shouldPromptWake: hasWake,
      shouldPromptSleep: hasSleep,
    }

    if (quality) {
      data.quality = quality
    }

    if (useCustomTime && timestamp) {
      data.timestamp = new Date(timestamp).toISOString()
    }

    if (useManualDuration && duration) {
      data.duration = parseInt(duration, 10)
    }

    onSubmit(data)
    handleClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl/Cmd + Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="w-full max-w-4xl px-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="text-neutral text-sm tracking-wide">
                LOG ENTRY
              </div>
              
              {/* Main content textarea */}
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What were you working on?&#10;&#10;Examples:&#10;Deep work on research paper&#10;Reviewed PR and fixed bugs&#10;Browsing social media"
                className="w-full h-48 bg-transparent text-white text-lg leading-relaxed resize-none border-2 border-neutral focus:border-signal outline-none p-6 placeholder:text-neutral placeholder:text-base"
                style={{ fontFamily: 'IBM Plex Mono, monospace' }}
              />

              {/* Quality selector */}
              <div className="space-y-2">
                <label className="text-neutral text-xs tracking-wide">
                  QUALITY (OPTIONAL)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {QUALITY_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setQuality(quality === level.value ? '' : level.value)}
                      className={`p-3 border-2 transition-colors duration-150 ${
                        quality === level.value
                          ? `${level.bgColor} text-black border-current`
                          : `border-neutral ${level.color} hover:border-current`
                      }`}
                    >
                      <div className="text-xs font-medium">{level.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional fields row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Custom timestamp */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={useCustomTime}
                      onChange={(e) => setUseCustomTime(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-neutral text-xs tracking-wide">
                      CUSTOM TIME
                    </span>
                  </label>
                  {useCustomTime && (
                    <input
                      type="datetime-local"
                      value={timestamp}
                      onChange={(e) => setTimestamp(e.target.value)}
                      className="w-full bg-transparent text-white text-sm border-2 border-neutral focus:border-signal outline-none p-3"
                      style={{ fontFamily: 'IBM Plex Mono, monospace' }}
                    />
                  )}
                </div>

                {/* Manual duration */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={useManualDuration}
                      onChange={(e) => setUseManualDuration(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-neutral text-xs tracking-wide">
                      DURATION (MINUTES)
                    </span>
                  </label>
                  {useManualDuration && (
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 60"
                      min="1"
                      className="w-full bg-transparent text-white text-sm border-2 border-neutral focus:border-signal outline-none p-3"
                      style={{ fontFamily: 'IBM Plex Mono, monospace' }}
                    />
                  )}
                </div>
              </div>

              {/* Submit controls */}
              <div className="flex justify-between items-center pt-4">
                <div className="text-neutral text-xs tracking-wide">
                  ESC to cancel • ⌘+ENTER to submit
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={handleClose}
                    className="px-6 py-3 text-white border-2 border-white hover:bg-white hover:text-black transition-colors duration-150"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!content.trim()}
                    className="px-6 py-3 bg-signal text-black border-2 border-signal hover:bg-transparent hover:text-signal transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-signal disabled:hover:text-black"
                  >
                    SUBMIT
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

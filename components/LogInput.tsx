'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { containsWakeKeywords, containsSleepKeywords } from '@/lib/parser'

interface LogInputProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (content: string, shouldPromptWake?: boolean, shouldPromptSleep?: boolean) => void
}

export default function LogInput({ isOpen, onClose, onSubmit }: LogInputProps) {
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isOpen])

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
    onClose()
  }

  const handleSubmit = () => {
    if (!content.trim()) return

    const hasWake = containsWakeKeywords(content)
    const hasSleep = containsSleepKeywords(content)

    onSubmit(content, hasWake, hasSleep)
    setContent('')
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
            className="w-full max-w-4xl px-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="text-neutral text-sm tracking-wide">
                LOG ENTRY
              </div>
              
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type naturally like you would on a post-it note...&#10;&#10;Examples:&#10;9:30am woke up [wake]&#10;10-12 worked on alignment research [signal: 120]&#10;wasted 45min on twitter [wasted: 45]"
                className="w-full h-64 bg-transparent text-white text-lg leading-relaxed resize-none border-2 border-neutral focus:border-signal outline-none p-6 placeholder:text-neutral placeholder:text-base"
                style={{ fontFamily: 'IBM Plex Mono, monospace' }}
              />

              <div className="flex justify-between items-center">
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


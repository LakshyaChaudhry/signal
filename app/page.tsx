'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TimerProvider, useTimer } from '@/lib/timer-context'
import { useScrollPosition } from '@/lib/use-scroll'
import HeroTimer from '@/components/HeroTimer'
import HeroActions from '@/components/HeroActions'
import DailyProgressBar from '@/components/DailyProgressBar'
import DayStatusBar from '@/components/DayStatusBar'
import StickyHeader from '@/components/StickyHeader'
import TimelineView from '@/components/TimelineView'
import LogHistory from '@/components/LogHistory'
import LogInput from '@/components/LogInput'
import ConfirmationModal from '@/components/ConfirmationModal'
import PIPTimer from '@/components/PIPTimer'
import FloatingActionButtons from '@/components/FloatingActionButtons'

interface Day {
  id: string
  wakeTime: string
  sleepTime: string | null
  signalTotal: number
  wastedTotal: number
  entries: LogEntry[]
}

interface LogEntry {
  id: string
  timestamp: string
  content: string
  type: string
  duration: number | null
  quality?: string | null
}

function Dashboard() {
  const [currentDay, setCurrentDay] = useState<Day | null>(null)
  const [currentDayId, setCurrentDayId] = useState<string | null>(null)
  const [previousDayId, setPreviousDayId] = useState<string | null>(null)
  const [nextDayId, setNextDayId] = useState<string | null>(null)
  const [isInputOpen, setIsInputOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPIP, setShowPIP] = useState(false)
  const [logInputPrefill, setLogInputPrefill] = useState<any>(null)
  const [editingEntry, setEditingEntry] = useState<LogEntry | null>(null)
  
  // Day boundary prompts
  const [pendingWakeEntry, setPendingWakeEntry] = useState<any>(null)
  const [pendingSleepEntry, setPendingSleepEntry] = useState<any>(null)
  const [showWakePrompt, setShowWakePrompt] = useState(false)
  const [showSleepPrompt, setShowSleepPrompt] = useState(false)

  const { stopTimer, startTimer, pauseTimer, resumeTimer, resetTimer, isRunning, isPaused, currentEntryId: timerEntryId, currentDayId: timerDayId } = useTimer()
  const { isScrolled } = useScrollPosition()

  // Fetch current day on mount
  useEffect(() => {
    fetchCurrentDay()
  }, [])
  
  // Validate timer state on mount - check if draft entry still exists
  useEffect(() => {
    const validateTimerState = async () => {
      if (isRunning && timerEntryId && timerDayId) {
        try {
          // Check if the draft entry still exists (include drafts in query)
          const res = await fetch(`/api/entries?dayId=${timerDayId}&includeDrafts=true`)
          const data = await res.json()
          
          // Look for the draft entry
          const draftExists = data.entries?.some((entry: any) => 
            entry.id === timerEntryId && entry.isDraft
          )
          
          if (!draftExists) {
            // Draft entry is missing, reset the timer
            resetTimer()
          }
        } catch (err) {
          console.error('Error validating timer state:', err)
          // If validation fails, reset timer to be safe
          resetTimer()
        }
      }
    }
    
    // Only validate after initial loading is done
    if (!isLoading) {
      validateTimerState()
    }
  }, [isLoading, isRunning, timerEntryId, timerDayId, resetTimer]) // Run once after initial load

  const fetchCurrentDay = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const url = currentDayId ? `/api/days?dayId=${currentDayId}` : '/api/days'
      const res = await fetch(url)
      const data = await res.json()
      
      if (data.day) {
        setCurrentDay(data.day)
        setCurrentDayId(data.day.id)
        setPreviousDayId(data.previousDayId)
        setNextDayId(data.nextDayId)
      }
    } catch (err) {
      console.error('Error fetching day:', err)
      setError('Failed to fetch day data')
    } finally {
      setIsLoading(false)
    }
  }
  
  const fetchDayById = async (dayId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch(`/api/days?dayId=${dayId}`)
      const data = await res.json()
      
      if (data.day) {
        setCurrentDay(data.day)
        setCurrentDayId(data.day.id)
        setPreviousDayId(data.previousDayId)
        setNextDayId(data.nextDayId)
      }
    } catch (err) {
      console.error('Error fetching day:', err)
      setError('Failed to fetch day')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handlePreviousDay = () => {
    if (previousDayId) {
      fetchDayById(previousDayId)
    }
  }
  
  const handleNextDay = () => {
    if (nextDayId) {
      fetchDayById(nextDayId)
    }
  }
  
  const handleUpdateWakeTime = async (newWakeTime: string) => {
    if (!currentDay) return
    
    try {
      const res = await fetch('/api/days', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayId: currentDay.id,
          wakeTime: newWakeTime,
        }),
      })
      
      if (!res.ok) throw new Error('Failed to update wake time')
      
      const data = await res.json()
      // BUG FIX: Update all navigation state, not just currentDay
      setCurrentDay(data.day)
      setCurrentDayId(data.day.id)
      setPreviousDayId(data.previousDayId || null)
      setNextDayId(data.nextDayId || null)
    } catch (err) {
      console.error('Error updating wake time:', err)
      setError('Failed to update wake time')
    }
  }
  
  const handleEditEntry = (entry: LogEntry) => {
    setEditingEntry(entry)
    setLogInputPrefill({
      content: entry.content,
      quality: entry.quality || undefined,
      duration: entry.duration || undefined,
      timestamp: entry.timestamp,
    })
    setIsInputOpen(true)
  }
  
  const updateLogEntry = async (entryId: string, data: {
    content?: string
    quality?: string
    duration?: number
    timestamp?: string
  }) => {
    try {
      const res = await fetch('/api/entries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryId,
          ...data,
          isDraft: false,
        }),
      })
      
      if (!res.ok) throw new Error('Failed to update entry')
      
      const result = await res.json()
      setCurrentDay(result.day)
      return result.entry
    } catch (err) {
      console.error('Error updating entry:', err)
      setError('Failed to update entry')
      return null
    }
  }

  const createNewDay = async (wakeTime: string) => {
    try {
      const res = await fetch('/api/days', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wakeTime }),
      })
      
      if (!res.ok) throw new Error('Failed to create day')
      
      const data = await res.json()
      // BUG FIX: Update all navigation state, not just currentDay
      setCurrentDay(data.day)
      setCurrentDayId(data.day.id)
      setPreviousDayId(data.previousDayId || null)
      setNextDayId(data.nextDayId || null)
      return data.day
    } catch (err) {
      console.error('Error creating day:', err)
      setError('Failed to create new day')
      return null
    }
  }

  const closeCurrentDay = async (sleepTime: string) => {
    if (!currentDay) return

    try {
      const res = await fetch('/api/days', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayId: currentDay.id,
          sleepTime,
        }),
      })
      
      if (!res.ok) throw new Error('Failed to close day')
      
      const data = await res.json()
      // BUG FIX: Update all navigation state, not just currentDay
      setCurrentDay(data.day)
      setCurrentDayId(data.day.id)
      setPreviousDayId(data.previousDayId || null)
      setNextDayId(data.nextDayId || null)
    } catch (err) {
      console.error('Error closing day:', err)
      setError('Failed to close day')
    }
  }

  const createLogEntry = async (data: {
    content: string
    quality?: string
    timestamp?: string
    duration?: number
    isDraft?: boolean
  }) => {
    if (!currentDay) return null

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayId: currentDay.id,
          ...data,
        }),
      })
      
      if (!res.ok) throw new Error('Failed to create entry')
      
      const result = await res.json()
      setCurrentDay(result.day)
      return result.entry
    } catch (err) {
      console.error('Error creating entry:', err)
      setError('Failed to create log entry')
      return null
    }
  }

  const deleteLogEntry = async (entryId: string) => {
    try {
      const res = await fetch(`/api/entries?entryId=${entryId}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) throw new Error('Failed to delete entry')
      
      await fetchCurrentDay()
    } catch (err) {
      console.error('Error deleting entry:', err)
      setError('Failed to delete entry')
    }
  }

  // Timer handlers
  const handleTimerStart = async () => {
    let day = currentDay
    if (!day) {
      const now = new Date().toISOString()
      day = await createNewDay(now)
      if (!day) return
    }

    const draftEntry = await createLogEntry({
      content: 'Working...',
      timestamp: new Date().toISOString(),
      isDraft: true,
    })

    if (draftEntry && day) {
      startTimer(day.id, draftEntry.id)
    }
  }

  const handleTimerStop = async () => {
    const { duration, entryId } = stopTimer()
    
    if (!entryId) {
      setError('No active timer entry found')
      return
    }

    setLogInputPrefill({
      duration,
      timestamp: new Date().toISOString(),
      content: 'Working...',
    })
    setIsInputOpen(true)
    setShowPIP(false)
  }

  const handlePauseResume = () => {
    if (isPaused) {
      resumeTimer()
    } else {
      pauseTimer()
    }
  }

  // Log entry submission
  const handleLogSubmit = async (data: {
    content: string
    quality?: string
    timestamp?: string
    duration?: number
    shouldPromptWake?: boolean
    shouldPromptSleep?: boolean
  }) => {
    setIsInputOpen(false)

    // If editing an existing entry, update it
    if (editingEntry) {
      await updateLogEntry(editingEntry.id, {
        content: data.content,
        quality: data.quality,
        duration: data.duration,
        timestamp: data.timestamp, // Include timestamp in update
      })
      setEditingEntry(null)
      setLogInputPrefill(null)
      return
    }

    if (!currentDay && data.shouldPromptWake) {
      setPendingWakeEntry(data)
      setShowWakePrompt(true)
      return
    }

    if (currentDay && data.shouldPromptSleep) {
      setPendingSleepEntry(data)
      setShowSleepPrompt(true)
      return
    }

    if (currentDay) {
      await createLogEntry(data)
    } else {
      const now = new Date().toISOString()
      const newDay = await createNewDay(now)
      if (newDay) {
        await createLogEntry(data)
      }
    }

    setLogInputPrefill(null)
  }

  const handleWakeConfirm = async () => {
    setShowWakePrompt(false)
    
    if (pendingWakeEntry) {
      const now = new Date().toISOString()
      const newDay = await createNewDay(now)
      
      if (newDay) {
        await createLogEntry({
          ...pendingWakeEntry,
          timestamp: now,
        })
      }
    }
    
    setPendingWakeEntry(null)
  }

  const handleWakeCancel = () => {
    setShowWakePrompt(false)
    if (pendingWakeEntry && currentDay) {
      createLogEntry(pendingWakeEntry)
    }
    setPendingWakeEntry(null)
  }

  const handleSleepConfirm = async () => {
    setShowSleepPrompt(false)
    
    if (pendingSleepEntry && currentDay) {
      const now = new Date().toISOString()
      await createLogEntry({
        ...pendingSleepEntry,
        timestamp: now,
      })
      await closeCurrentDay(now)
    }
    
    setPendingSleepEntry(null)
  }

  const handleSleepCancel = () => {
    setShowSleepPrompt(false)
    if (pendingSleepEntry && currentDay) {
      createLogEntry(pendingSleepEntry)
    }
    setPendingSleepEntry(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral text-sm tracking-wide">
          LOADING...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Day Status Bar */}
      <DayStatusBar 
        currentDay={currentDay}
        onPreviousDay={handlePreviousDay}
        onNextDay={handleNextDay}
        onUpdateWakeTime={handleUpdateWakeTime}
        hasPrevious={!!previousDayId}
        hasNext={!!nextDayId}
      />

      {/* Sticky Header (visible when scrolled) */}
      <StickyHeader
        isVisible={isScrolled}
        signalMinutes={currentDay?.signalTotal || 0}
        onPauseResume={handlePauseResume}
        onStop={handleTimerStop}
      />

      {/* Hero Section (Above the fold) */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 space-y-12">
        {/* Signal Branding */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-white text-3xl font-bold tracking-tight mb-8"
        >
          SIGNAL
        </motion.div>
        
        {/* Hero Timer */}
        <HeroTimer 
          signalMinutes={currentDay?.signalTotal || 0}
          onTogglePIP={() => setShowPIP(true)}
        />

        {/* Action Buttons (only visible when not scrolled) */}
        {!isScrolled && (
          <HeroActions
            onStartFocus={handleTimerStart}
            onAddLog={() => setIsInputOpen(true)}
            onPauseResume={handlePauseResume}
            onStop={handleTimerStop}
            isTimerRunning={isRunning}
            isTimerPaused={isPaused}
          />
        )}

        {/* Daily Progress Bar */}
        {currentDay && (
          <DailyProgressBar
            wakeTime={currentDay.wakeTime}
            sleepTime={currentDay.sleepTime}
            entries={currentDay.entries || []}
          />
        )}

        {/* Scroll indicator */}
        {!isScrolled && currentDay && currentDay.entries.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute bottom-8 text-neutral text-xs tracking-widest"
          >
            ↓ SCROLL FOR DETAILS
          </motion.div>
        )}
      </section>

      {/* Details Section (Below the fold - revealed on scroll) */}
      {currentDay && currentDay.entries.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: isScrolled ? 1 : 0.3 }}
          transition={{ duration: 0.4 }}
          className="max-w-6xl mx-auto px-8 py-16 space-y-12"
        >
          {/* Section Title */}
          <div className="text-center">
            <h2 className="text-white text-xl tracking-tight font-bold mb-2">
              TODAY'S LOG
            </h2>
            <div className="text-neutral text-xs tracking-widest">
              DETAILED BREAKDOWN
            </div>
          </div>

          {/* Timeline */}
          <TimelineView
            wakeTime={currentDay.wakeTime}
            sleepTime={currentDay.sleepTime}
            entries={currentDay.entries || []}
          />

          {/* Log History */}
          <LogHistory
            entries={currentDay.entries || []}
            onDeleteEntry={deleteLogEntry}
            onEditEntry={handleEditEntry}
          />
        </motion.section>
      )}

      {/* Floating Action Buttons (visible when scrolled) */}
      <FloatingActionButtons
        isVisible={isScrolled && !showPIP}
        isTimerRunning={isRunning}
        isTimerPaused={isPaused}
        onStartFocus={handleTimerStart}
        onPauseResume={handlePauseResume}
        onAddLog={() => setIsInputOpen(true)}
        onTogglePIP={() => setShowPIP(true)}
      />

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 border-2 border-red-500 bg-black p-4"
          >
            <div className="text-red-500 text-sm">{error}</div>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-xs text-neutral hover:text-white"
            >
              DISMISS
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PIP Timer */}
      <AnimatePresence>
        {showPIP && isRunning && (
          <PIPTimer
            onStop={handleTimerStop}
            onMaximize={() => setShowPIP(false)}
          />
        )}
      </AnimatePresence>

      {/* Log Input Modal */}
      <LogInput
        isOpen={isInputOpen}
        onClose={() => {
          setIsInputOpen(false)
          setLogInputPrefill(null)
          setEditingEntry(null)
        }}
        onSubmit={handleLogSubmit}
        prefillData={logInputPrefill}
      />

      {/* Wake Confirmation Modal */}
      <ConfirmationModal
        isOpen={showWakePrompt}
        title="DAY BOUNDARY"
        message="Mark this as your wake-up time and start a new day?"
        onConfirm={handleWakeConfirm}
        onCancel={handleWakeCancel}
        confirmText="START NEW DAY"
        cancelText="NO, JUST LOG IT"
      />

      {/* Sleep Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSleepPrompt}
        title="DAY BOUNDARY"
        message="Mark this as your sleep time and close the current day?"
        onConfirm={handleSleepConfirm}
        onCancel={handleSleepCancel}
        confirmText="CLOSE DAY"
        cancelText="NO, KEEP OPEN"
      />
    </div>
  )
}

export default function Home() {
  return (
    <TimerProvider>
      <Dashboard />
    </TimerProvider>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TimerProvider, useTimer } from '@/lib/timer-context'
import SignalTimer from '@/components/SignalTimer'
import TimelineView from '@/components/TimelineView'
import LogHistory from '@/components/LogHistory'
import LogInput from '@/components/LogInput'
import DaySelector from '@/components/DaySelector'
import ConfirmationModal from '@/components/ConfirmationModal'
import LiveTimer from '@/components/LiveTimer'
import PIPTimer from '@/components/PIPTimer'

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
  const [isInputOpen, setIsInputOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPIP, setShowPIP] = useState(false)
  const [logInputPrefill, setLogInputPrefill] = useState<any>(null)
  
  // Day boundary prompts
  const [pendingWakeEntry, setPendingWakeEntry] = useState<any>(null)
  const [pendingSleepEntry, setPendingSleepEntry] = useState<any>(null)
  const [showWakePrompt, setShowWakePrompt] = useState(false)
  const [showSleepPrompt, setShowSleepPrompt] = useState(false)

  const { stopTimer, startTimer, isRunning } = useTimer()

  // Fetch current day on mount
  useEffect(() => {
    fetchCurrentDay()
  }, [])

  const fetchCurrentDay = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch('/api/days')
      const data = await res.json()
      
      if (data.day) {
        setCurrentDay(data.day)
      }
    } catch (err) {
      console.error('Error fetching day:', err)
      setError('Failed to fetch day data')
    } finally {
      setIsLoading(false)
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
      setCurrentDay(data.day)
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
      setCurrentDay(data.day)
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

  const updateLogEntry = async (entryId: string, data: {
    content?: string
    quality?: string
    duration?: number
    isDraft?: boolean
  }) => {
    try {
      const res = await fetch('/api/entries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryId,
          ...data,
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

  // Timer start handler
  const handleTimerStart = async () => {
    // Ensure we have a day
    let day = currentDay
    if (!day) {
      const now = new Date().toISOString()
      day = await createNewDay(now)
      if (!day) return
    }

    // Create draft entry
    const draftEntry = await createLogEntry({
      content: 'Working...',
      timestamp: new Date().toISOString(),
      isDraft: true,
    } as any)

    if (draftEntry && day) {
      // Start the timer with the draft entry ID
      startTimer(day.id, draftEntry.id)
    }
  }

  // Timer stop handler
  const handleTimerStop = async () => {
    const { duration, entryId } = stopTimer()
    
    if (!entryId) {
      setError('No active timer entry found')
      return
    }

    // Pre-fill the log input with timer data
    setLogInputPrefill({
      duration,
      timestamp: new Date().toISOString(),
      content: 'Working...',
    })
    setIsInputOpen(true)
    setShowPIP(false)
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

    // Handle wake prompt
    if (!currentDay && data.shouldPromptWake) {
      setPendingWakeEntry(data)
      setShowWakePrompt(true)
      return
    }

    // Handle sleep prompt
    if (currentDay && data.shouldPromptSleep) {
      setPendingSleepEntry(data)
      setShowSleepPrompt(true)
      return
    }

    // Regular entry creation
    if (currentDay) {
      await createLogEntry(data)
    } else {
      // No day exists - create one
      const now = new Date().toISOString()
      const newDay = await createNewDay(now)
      if (newDay) {
        await createLogEntry(data)
      }
    }

    // Clear prefill data
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
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-0">
        {/* Header */}
        <div className="flex justify-between items-center py-8">
          <motion.h1 
            className="text-white text-2xl tracking-tight font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            SIGNAL
          </motion.h1>
          
          <div className="text-neutral text-xs tracking-widest">
            PRODUCTIVITY TRACKING V2
          </div>
        </div>

        {/* Error display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-2 border-red-500 bg-red-500 bg-opacity-10 p-4 mb-6"
          >
            <div className="text-red-500 text-sm">{error}</div>
          </motion.div>
        )}

        {/* Day Selector */}
        {currentDay && (
          <DaySelector
            currentDay={currentDay}
            hasNext={false}
            hasPrevious={false}
          />
        )}

        {/* Signal Timer */}
        <SignalTimer
          signalMinutes={currentDay?.signalTotal || 0}
          wastedMinutes={currentDay?.wastedTotal || 0}
        />

        {/* Timeline */}
        {currentDay && (
          <TimelineView
            wakeTime={currentDay.wakeTime}
            sleepTime={currentDay.sleepTime}
            entries={currentDay.entries || []}
          />
        )}

        {/* Log History */}
        <LogHistory
          entries={currentDay?.entries || []}
          onDeleteEntry={deleteLogEntry}
        />

        {/* Live Timer (bottom-left) */}
        <LiveTimer
          onStart={handleTimerStart}
          onStop={handleTimerStop}
          onTogglePIP={() => setShowPIP(!showPIP)}
          isPIPVisible={showPIP}
        />

        {/* PIP Timer (when minimized) */}
        <AnimatePresence>
          {showPIP && isRunning && (
            <PIPTimer
              onStop={handleTimerStop}
              onMaximize={() => setShowPIP(false)}
            />
          )}
        </AnimatePresence>

        {/* New Log Entry Button (bottom-right) */}
        {!isRunning && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsInputOpen(true)}
            className="fixed bottom-8 right-8 px-8 py-4 bg-signal text-black border-2 border-signal hover:bg-transparent hover:text-signal transition-colors duration-150 text-sm tracking-wide font-medium shadow-xl"
          >
            + NEW LOG ENTRY
          </motion.button>
        )}

        {/* Log Input Modal */}
        <LogInput
          isOpen={isInputOpen}
          onClose={() => {
            setIsInputOpen(false)
            setLogInputPrefill(null)
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
    </main>
  )
}

export default function Home() {
  return (
    <TimerProvider>
      <Dashboard />
    </TimerProvider>
  )
}

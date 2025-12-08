'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SignalTimer from '@/components/SignalTimer'
import TimelineView from '@/components/TimelineView'
import LogHistory from '@/components/LogHistory'
import LogInput from '@/components/LogInput'
import DaySelector from '@/components/DaySelector'
import ConfirmationModal from '@/components/ConfirmationModal'

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
}

interface PendingEntry {
  content: string
  shouldPromptWake: boolean
  shouldPromptSleep: boolean
}

export default function Home() {
  const [currentDay, setCurrentDay] = useState<Day | null>(null)
  const [isInputOpen, setIsInputOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Day boundary prompts
  const [pendingEntry, setPendingEntry] = useState<PendingEntry | null>(null)
  const [showWakePrompt, setShowWakePrompt] = useState(false)
  const [showSleepPrompt, setShowSleepPrompt] = useState(false)

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

  const createLogEntry = async (content: string, timestamp?: string) => {
    if (!currentDay) return

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayId: currentDay.id,
          content,
          timestamp: timestamp || new Date().toISOString(),
        }),
      })
      
      if (!res.ok) throw new Error('Failed to create entry')
      
      const data = await res.json()
      setCurrentDay(data.day)
    } catch (err) {
      console.error('Error creating entry:', err)
      setError('Failed to create log entry')
    }
  }

  const deleteLogEntry = async (entryId: string) => {
    try {
      const res = await fetch(`/api/entries?entryId=${entryId}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) throw new Error('Failed to delete entry')
      
      // Refresh current day
      await fetchCurrentDay()
    } catch (err) {
      console.error('Error deleting entry:', err)
      setError('Failed to delete entry')
    }
  }

  const handleLogSubmit = (content: string, shouldPromptWake = false, shouldPromptSleep = false) => {
    setIsInputOpen(false)

    // If no current day and this looks like a wake entry, prompt to create day
    if (!currentDay && shouldPromptWake) {
      setPendingEntry({ content, shouldPromptWake, shouldPromptSleep })
      setShowWakePrompt(true)
      return
    }

    // If current day exists but this looks like a sleep entry, prompt to close day
    if (currentDay && shouldPromptSleep) {
      setPendingEntry({ content, shouldPromptWake, shouldPromptSleep })
      setShowSleepPrompt(true)
      return
    }

    // Otherwise, just create the entry
    if (currentDay) {
      createLogEntry(content)
    } else {
      // No day exists and no wake keyword - create a day automatically
      const now = new Date().toISOString()
      createNewDay(now).then((newDay) => {
        if (newDay) {
          // Create entry after day is created
          createLogEntry(content)
        }
      })
    }
  }

  const handleWakeConfirm = async () => {
    setShowWakePrompt(false)
    
    if (pendingEntry) {
      const now = new Date().toISOString()
      const newDay = await createNewDay(now)
      
      if (newDay) {
        // Create the wake entry
        await createLogEntry(pendingEntry.content, now)
      }
    }
    
    setPendingEntry(null)
  }

  const handleWakeCancel = () => {
    setShowWakePrompt(false)
    
    // Still create the entry as a normal entry
    if (pendingEntry && currentDay) {
      createLogEntry(pendingEntry.content)
    }
    
    setPendingEntry(null)
  }

  const handleSleepConfirm = async () => {
    setShowSleepPrompt(false)
    
    if (pendingEntry && currentDay) {
      const now = new Date().toISOString()
      
      // Create the sleep entry first
      await createLogEntry(pendingEntry.content, now)
      
      // Then close the day
      await closeCurrentDay(now)
    }
    
    setPendingEntry(null)
  }

  const handleSleepCancel = () => {
    setShowSleepPrompt(false)
    
    // Still create the entry but don't close the day
    if (pendingEntry && currentDay) {
      createLogEntry(pendingEntry.content)
    }
    
    setPendingEntry(null)
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
            PRODUCTIVITY TRACKING
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

        {/* New Log Entry Button */}
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

        {/* Log Input Modal */}
        <LogInput
          isOpen={isInputOpen}
          onClose={() => setIsInputOpen(false)}
          onSubmit={handleLogSubmit}
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


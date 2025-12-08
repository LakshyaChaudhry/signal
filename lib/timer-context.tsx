'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

interface TimerState {
  isRunning: boolean
  isPaused: boolean
  startTime: number | null
  elapsedTime: number // milliseconds
  currentEntryId: string | null
  currentDayId: string | null
}

interface TimerContextType {
  // State
  isRunning: boolean
  isPaused: boolean
  elapsedTime: number
  currentEntryId: string | null
  formattedTime: string
  
  // Actions
  startTimer: (dayId: string, entryId: string) => void
  pauseTimer: () => void
  resumeTimer: () => void
  stopTimer: () => { duration: number; entryId: string | null }
  resetTimer: () => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

const STORAGE_KEY = 'signal_timer_state'

// Helper to format time as HH:MM:SS
function formatElapsedTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    startTime: null,
    elapsedTime: 0,
    currentEntryId: null,
    currentDayId: null,
  })
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY)
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState) as TimerState
        setTimerState(parsed)
        
        // If timer was running when page closed, resume it
        if (parsed.isRunning && !parsed.isPaused && parsed.startTime) {
          // Recalculate elapsed time accounting for time passed while page was closed
          const now = Date.now()
          const timePassedWhileClosed = now - parsed.startTime
          setTimerState(prev => ({
            ...prev,
            elapsedTime: parsed.elapsedTime + timePassedWhileClosed,
            startTime: now,
          }))
        }
      } catch (error) {
        console.error('Failed to parse timer state from localStorage:', error)
      }
    }
  }, [])
  
  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timerState))
  }, [timerState])
  
  // Timer tick effect
  useEffect(() => {
    if (timerState.isRunning && !timerState.isPaused) {
      intervalRef.current = setInterval(() => {
        setTimerState(prev => {
          if (!prev.startTime) return prev
          
          const now = Date.now()
          const elapsed = now - prev.startTime
          
          return {
            ...prev,
            elapsedTime: elapsed,
          }
        })
      }, 100) // Update every 100ms for smooth display
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [timerState.isRunning, timerState.isPaused])
  
  const startTimer = useCallback((dayId: string, entryId: string) => {
    const now = Date.now()
    setTimerState({
      isRunning: true,
      isPaused: false,
      startTime: now,
      elapsedTime: 0,
      currentEntryId: entryId,
      currentDayId: dayId,
    })
  }, [])
  
  const pauseTimer = useCallback(() => {
    setTimerState(prev => {
      if (!prev.isRunning || prev.isPaused) return prev
      
      return {
        ...prev,
        isPaused: true,
      }
    })
  }, [])
  
  const resumeTimer = useCallback(() => {
    setTimerState(prev => {
      if (!prev.isPaused) return prev
      
      const now = Date.now()
      return {
        ...prev,
        isPaused: false,
        startTime: now,
      }
    })
  }, [])
  
  const stopTimer = useCallback(() => {
    const duration = Math.floor(timerState.elapsedTime / 1000 / 60) // Convert to minutes
    const entryId = timerState.currentEntryId
    
    setTimerState({
      isRunning: false,
      isPaused: false,
      startTime: null,
      elapsedTime: 0,
      currentEntryId: null,
      currentDayId: null,
    })
    
    return { duration, entryId }
  }, [timerState])
  
  const resetTimer = useCallback(() => {
    setTimerState({
      isRunning: false,
      isPaused: false,
      startTime: null,
      elapsedTime: 0,
      currentEntryId: null,
      currentDayId: null,
    })
    localStorage.removeItem(STORAGE_KEY)
  }, [])
  
  const value: TimerContextType = {
    isRunning: timerState.isRunning,
    isPaused: timerState.isPaused,
    elapsedTime: timerState.elapsedTime,
    currentEntryId: timerState.currentEntryId,
    formattedTime: formatElapsedTime(timerState.elapsedTime),
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
  }
  
  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider')
  }
  return context
}


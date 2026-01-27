// Shared type definitions for the Signal app

// Plan & Pricing types
export type PlanTier = 'free' | 'pro'

// Quality levels for log entries
export type QualityLevel = 'deep' | 'focused' | 'neutral' | 'distracted' | 'wasted'

// Entry types
export type EntryType = 'wake' | 'sleep' | 'signal' | 'wasted' | 'neutral'

export interface Day {
  id: string
  wakeTime: string
  sleepTime: string | null
  signalTotal: number
  wastedTotal: number
  entries: LogEntry[]
  createdAt?: string
  updatedAt?: string
}

export interface LogEntry {
  id: string
  dayId?: string
  timestamp: string
  content: string
  type: EntryType | string
  duration: number | null
  quality?: QualityLevel | string | null
  isDraft?: boolean
  createdAt?: string
}

export interface ParsedEntry {
  type: EntryType
  duration: number | null
  content: string
}

export interface TimelineBlock {
  id: string
  startMinute: number
  durationMinutes: number
  type: string
  quality?: string | null
  content: string
  timestamp: string
}


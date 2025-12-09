// Shared type definitions for the Signal app

// Plan & Pricing types
export type PlanTier = 'free' | 'pro'

export interface UserPlan {
  tier: PlanTier
  // Future: stripe_customer_id, subscription_id, etc.
}

export interface Day {
  id: string
  wakeTime: string
  sleepTime: string | null
  signalTotal: number
  wastedTotal: number
  entries: LogEntry[]
  createdAt: string
  updatedAt: string
}

export interface LogEntry {
  id: string
  dayId: string
  timestamp: string
  content: string
  type: 'wake' | 'sleep' | 'signal' | 'wasted' | 'neutral'
  duration: number | null
  createdAt: string
}

export interface ParsedEntry {
  type: 'wake' | 'sleep' | 'signal' | 'wasted' | 'neutral'
  duration: number | null
  content: string
}

export interface TimelineBlock {
  id: string
  startMinute: number
  durationMinutes: number
  type: string
  content: string
  timestamp: string
}


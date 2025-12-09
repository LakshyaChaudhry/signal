'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { PlanTier } from '@/types'

interface PlanContextType {
  plan: PlanTier
  setPlan: (plan: PlanTier) => void
  isPro: boolean
}

const PlanContext = createContext<PlanContextType | undefined>(undefined)

export function PlanProvider({ children }: { children: ReactNode }) {
  // For now, hardcoded as 'pro' for development/testing
  // TODO: In production, get from:
  // 1. Auth session (Clerk, NextAuth, etc.)
  // 2. Database user.plan field
  // 3. Stripe subscription status
  const [plan, setPlan] = useState<PlanTier>('pro')

  const value = {
    plan,
    setPlan,
    isPro: plan === 'pro'
  }

  return (
    <PlanContext.Provider value={value}>
      {children}
    </PlanContext.Provider>
  )
}

export function usePlan() {
  const context = useContext(PlanContext)
  if (context === undefined) {
    throw new Error('usePlan must be used within a PlanProvider')
  }
  return context
}

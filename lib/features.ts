/**
 * Feature flag system for Free vs Pro tiers
 * Single codebase with gated features
 */

export type PlanTier = 'free' | 'pro'

/**
 * Feature availability by tier
 */
export const FEATURES = {
  // Free tier features (always available)
  free: {
    manualLogging: true,
    liveTimer: true,
    qualityLevels: true,
    dayBoundaries: true,
    basicTimeline: true,
    logHistory: true,
    editEntries: true,
    deleteEntries: true,
    dayNavigation: true,
    pipMode: true,
  },
  
  // Pro tier features (gated)
  pro: {
    // v0.2: Smart Parsing
    aiParsing: true,
    autoSuggestions: true,
    
    // v0.3: Analytics
    trendAnalysis: true,
    patternDetection: true,
    productivityInsights: true,
    weeklyReports: true,
    
    // v0.4: AI Coaching
    aiCoach: true,
    dailyFeedback: true,
    goalTracking: true,
    habitDetection: true,
    
    // v0.5: Integrations
    whoopSync: true,
    whoopDiscrepancy: true,
    recoveryInsights: true,
    
    // v0.6: More Integrations
    notionSync: true,
    taskComparison: true,
    
    // General Pro Features
    dataExport: true,
    customGoals: true,
    unlimitedHistory: true,
    prioritySupport: true,
  }
} as const

/**
 * Check if user has access to a Pro feature
 */
export function hasFeature(
  plan: PlanTier, 
  feature: keyof typeof FEATURES.pro
): boolean {
  return plan === 'pro'
}

/**
 * Get all available features for a plan
 */
export function getAvailableFeatures(plan: PlanTier): string[] {
  if (plan === 'pro') {
    return [
      ...Object.keys(FEATURES.free),
      ...Object.keys(FEATURES.pro)
    ]
  }
  return Object.keys(FEATURES.free)
}

/**
 * Feature metadata for UI display
 */
export const FEATURE_INFO = {
  aiParsing: {
    name: 'AI Parsing',
    description: 'Type naturally, AI extracts quality, duration, and context',
    badge: 'PRO',
  },
  trendAnalysis: {
    name: 'Trend Analysis',
    description: 'Discover your productivity patterns and peak hours',
    badge: 'PRO',
  },
  aiCoach: {
    name: 'Brutal Honesty Coach',
    description: 'AI accountability partner that keeps you on track',
    badge: 'PRO',
  },
  whoopSync: {
    name: 'Whoop Integration',
    description: 'Sync biometrics and catch discrepancies',
    badge: 'PRO',
  },
  notionSync: {
    name: 'Notion Integration',
    description: 'Compare planned tasks with actual work',
    badge: 'PRO',
  },
  dataExport: {
    name: 'Data Export',
    description: 'Export your data to JSON/CSV',
    badge: 'PRO',
  },
} as const

/**
 * Pricing tiers for display
 */
export const PRICING = {
  free: {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      'Manual time logging',
      'Live timer with pause/resume',
      '5-level quality system',
      'Timeline visualization',
      'Day boundaries (wake/sleep)',
      'Basic history & navigation',
      'Edit/delete entries',
    ]
  },
  pro: {
    name: 'Pro',
    price: '$9',
    period: 'month',
    features: [
      'Everything in Free',
      '✨ AI-powered parsing',
      '📊 Trend analysis & insights',
      '🤖 Brutal honesty AI coach',
      '🔗 Whoop & Notion sync',
      '💾 Data export (JSON/CSV)',
      '🎯 Custom goals & tracking',
      '⚡ Priority support',
    ]
  }
} as const

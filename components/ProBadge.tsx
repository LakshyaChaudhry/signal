'use client'

import { motion } from 'framer-motion'

interface ProBadgeProps {
  variant?: 'default' | 'compact'
  animated?: boolean
}

/**
 * PRO badge with auraful glow effect
 * Shows premium tier branding
 */
export default function ProBadge({ variant = 'default', animated = true }: ProBadgeProps) {
  const isCompact = variant === 'compact'
  
  const badge = (
    <div 
      className={`
        relative inline-block
        ${isCompact ? 'px-2 py-0.5 text-[8px]' : 'px-3 py-1 text-[10px]'}
        font-bold tracking-widest
        border border-signal text-signal
        ${animated ? 'pro-glow' : ''}
      `}
      style={{
        // Subtle aura glow effect
        boxShadow: animated 
          ? '0 0 10px rgba(14, 165, 233, 0.3), 0 0 20px rgba(14, 165, 233, 0.1)' 
          : 'none'
      }}
    >
      PRO
    </div>
  )

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {badge}
      </motion.div>
    )
  }

  return badge
}

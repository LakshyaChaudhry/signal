'use client'

interface Day {
  id: string
  wakeTime: string
  sleepTime: string | null
  signalTotal: number
  wastedTotal: number
}

interface DaySelectorProps {
  currentDay: Day | null
  onPrevious?: () => void
  onNext?: () => void
  hasNext?: boolean
  hasPrevious?: boolean
}

export default function DaySelector({ 
  currentDay, 
  onPrevious, 
  onNext,
  hasNext = false,
  hasPrevious = false 
}: DaySelectorProps) {
  if (!currentDay) {
    return (
      <div className="flex justify-center items-center py-6">
        <div className="text-neutral text-sm">
          No day data available
        </div>
      </div>
    )
  }

  const wakeDate = new Date(currentDay.wakeTime)
  const sleepDate = currentDay.sleepTime ? new Date(currentDay.sleepTime) : null
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const isToday = !currentDay.sleepTime

  return (
    <div className="flex items-center justify-between py-6 border-b-2 border-neutral">
      {/* Previous Day Button */}
      <button
        onClick={onPrevious}
        disabled={!hasPrevious}
        className="text-neutral hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 px-4 py-2 border-2 border-neutral hover:border-white disabled:hover:border-neutral"
      >
        ← PREV
      </button>

      {/* Current Day Info */}
      <div className="flex flex-col items-center gap-2">
        {isToday ? (
          <div className="text-signal text-sm tracking-widest font-medium">
            TODAY
          </div>
        ) : (
          <div className="text-white text-sm tracking-wide">
            {formatDate(wakeDate)}
          </div>
        )}
        
        <div className="text-neutral text-xs tracking-wide">
          {formatTime(wakeDate)} → {sleepDate ? formatTime(sleepDate) : 'ONGOING'}
        </div>
      </div>

      {/* Next Day Button */}
      <button
        onClick={onNext}
        disabled={!hasNext}
        className="text-neutral hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 px-4 py-2 border-2 border-neutral hover:border-white disabled:hover:border-neutral"
      >
        NEXT →
      </button>
    </div>
  )
}


import { Day, TrendsSummary } from '@/types'

export function calculateTrends(days: Day[]): TrendsSummary {
  if (days.length === 0) {
    return {
      totalDays: 0,
      avgSignalMinutes: 0,
      avgWastedMinutes: 0,
      signalToWastedRatio: 0,
      peakHours: [],
      bestDay: null,
      worstDay: null,
      recentTrend: 'stable',
    }
  }

  const totalSignal = days.reduce((sum, d) => sum + d.signalTotal, 0)
  const totalWasted = days.reduce((sum, d) => sum + d.wastedTotal, 0)
  const avgSignal = Math.round(totalSignal / days.length)
  const avgWasted = Math.round(totalWasted / days.length)

  // Peak hours: bucket signal entries by hour
  const hourCounts: Record<number, number> = {}
  for (const day of days) {
    for (const entry of day.entries) {
      if (entry.type === 'signal' && entry.duration) {
        const hour = new Date(entry.timestamp).getHours()
        hourCounts[hour] = (hourCounts[hour] || 0) + entry.duration
      }
    }
  }
  const peakHours = Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => {
      const h = parseInt(hour)
      const start = h % 12 || 12
      const end = (h + 1) % 12 || 12
      const period = h < 12 ? 'AM' : 'PM'
      const endPeriod = (h + 1) < 12 ? 'AM' : 'PM'
      return `${start}${period}-${end}${endPeriod}`
    })

  // Best and worst days
  const sortedBySignal = [...days].sort((a, b) => b.signalTotal - a.signalTotal)
  const sortedByWasted = [...days].sort((a, b) => b.wastedTotal - a.wastedTotal)

  const bestDay = sortedBySignal[0]
    ? { date: new Date(sortedBySignal[0].wakeTime).toLocaleDateString(), signal: sortedBySignal[0].signalTotal }
    : null

  const worstDay = sortedByWasted[0] && sortedByWasted[0].wastedTotal > 0
    ? { date: new Date(sortedByWasted[0].wakeTime).toLocaleDateString(), wasted: sortedByWasted[0].wastedTotal }
    : null

  // Recent trend: compare last 7 days vs prior 7
  const sorted = [...days].sort((a, b) => new Date(b.wakeTime).getTime() - new Date(a.wakeTime).getTime())
  const recent = sorted.slice(0, 7)
  const prior = sorted.slice(7, 14)

  let recentTrend: 'improving' | 'declining' | 'stable' = 'stable'
  if (recent.length >= 3 && prior.length >= 3) {
    const recentAvg = recent.reduce((s, d) => s + d.signalTotal, 0) / recent.length
    const priorAvg = prior.reduce((s, d) => s + d.signalTotal, 0) / prior.length
    const change = priorAvg > 0 ? (recentAvg - priorAvg) / priorAvg : 0
    if (change > 0.1) recentTrend = 'improving'
    else if (change < -0.1) recentTrend = 'declining'
  }

  return {
    totalDays: days.length,
    avgSignalMinutes: avgSignal,
    avgWastedMinutes: avgWasted,
    signalToWastedRatio: totalWasted > 0 ? totalSignal / totalWasted : totalSignal,
    peakHours,
    bestDay,
    worstDay,
    recentTrend,
  }
}

export function formatDayContext(day: Day): string {
  if (!day.entries || day.entries.length === 0) {
    return 'No entries logged yet today.'
  }

  const lines = day.entries.map((entry) => {
    const time = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const quality = entry.quality ? ` (${entry.quality}` + (entry.duration ? `, ${entry.duration}min)` : ')') : ''
    return `${time} - ${entry.content}${quality}`
  })

  const summary = `Signal: ${day.signalTotal}min | Wasted: ${day.wastedTotal}min`
  return lines.join('\n') + '\n\n' + summary
}

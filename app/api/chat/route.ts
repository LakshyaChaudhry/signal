import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateTrends, formatDayContext } from '@/lib/trends'
import { Day } from '@/types'

function buildSystemPrompt(dayContext: string, trends: ReturnType<typeof calculateTrends>): string {
  return `You are Signal Coach, a thoughtful productivity coach embedded in the Signal time-tracking app. Your approach is inspired by Cal Newport's philosophy of deep work — you believe that the ability to focus without distraction on cognitively demanding tasks is one of the most valuable skills a person can develop.

PERSONALITY:
- Calm, evidence-based, and genuinely encouraging. Think: a wise mentor, not a drill sergeant.
- Help the user recognize when they've done meaningful deep work and gently identify when they've drifted.
- Frame distractions not as moral failures but as signals to recalibrate.
- Keep responses concise (2-4 sentences unless asked for detail).
- Reference specific data from the user's logs to ground your advice in reality.

CURRENT DAY'S LOG:
${dayContext}

HISTORICAL TRENDS (${trends.totalDays} days tracked):
- Avg daily signal: ${trends.avgSignalMinutes} min | Avg daily wasted: ${trends.avgWastedMinutes} min
- Signal-to-waste ratio: ${trends.signalToWastedRatio.toFixed(2)}
- Peak productivity hours: ${trends.peakHours.join(', ') || 'Not enough data'}
- Recent trend: ${trends.recentTrend}
${trends.bestDay ? `- Best day: ${trends.bestDay.date} (${trends.bestDay.signal} min signal)` : ''}
${trends.worstDay ? `- Worst day: ${trends.worstDay.date} (${trends.worstDay.wasted} min wasted)` : ''}

Use this data to give specific, data-backed feedback. Reference actual numbers and patterns.
If the user asks about their day, refer to the specific entries in the log above.
If asked about trends, reference the historical data.
Never make up data you don't have.`
}

export async function POST(request: NextRequest) {
  try {
    const { messages, dayId } = await request.json()

    // Fetch the specific day being viewed, or fall back to current open day
    const viewedDay = dayId
      ? await prisma.day.findUnique({
          where: { id: dayId },
          include: {
            entries: {
              where: { isDraft: false },
              orderBy: { timestamp: 'asc' },
            },
          },
        })
      : await prisma.day.findFirst({
          where: { sleepTime: null },
          include: {
            entries: {
              where: { isDraft: false },
              orderBy: { timestamp: 'asc' },
            },
          },
          orderBy: { wakeTime: 'desc' },
        })

    // Fetch all historical days for trends
    const allDays = await prisma.day.findMany({
      include: {
        entries: {
          where: { isDraft: false },
          orderBy: { timestamp: 'asc' },
        },
      },
      orderBy: { wakeTime: 'desc' },
    })

    const trends = calculateTrends(allDays as unknown as Day[])
    const dayContext = viewedDay ? formatDayContext(viewedDay as unknown as Day) : 'No active day.'
    const systemPrompt = buildSystemPrompt(dayContext, trends)

    // Proxy to LM Studio
    const lmResponse = await fetch('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    })

    if (!lmResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Coach is offline. Make sure LM Studio is running.' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Stream the response through
    return new Response(lmResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to reach coach. Is LM Studio running on localhost:1234?' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

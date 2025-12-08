import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseLogEntry } from '@/lib/parser'

// GET entries by dayId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dayId = searchParams.get('dayId')

    if (!dayId) {
      return NextResponse.json(
        { error: 'dayId is required' },
        { status: 400 }
      )
    }

    const entries = await prisma.logEntry.findMany({
      where: { dayId },
      orderBy: {
        timestamp: 'desc',
      },
    })

    return NextResponse.json({ entries })
  } catch (error) {
    console.error('Error fetching entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    )
  }
}

// POST create new log entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dayId, content, timestamp } = body

    if (!dayId || !content) {
      return NextResponse.json(
        { error: 'dayId and content are required' },
        { status: 400 }
      )
    }

    // Parse the entry content
    const parsed = parseLogEntry(content)

    // Create the log entry
    const entry = await prisma.logEntry.create({
      data: {
        dayId,
        content: parsed.content,
        type: parsed.type,
        duration: parsed.duration,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      },
    })

    // Update day totals if this is a signal or wasted entry
    if (parsed.type === 'signal' && parsed.duration) {
      const day = await prisma.day.findUnique({
        where: { id: dayId },
      })
      
      if (day) {
        await prisma.day.update({
          where: { id: dayId },
          data: {
            signalTotal: day.signalTotal + parsed.duration,
          },
        })
      }
    } else if (parsed.type === 'wasted' && parsed.duration) {
      const day = await prisma.day.findUnique({
        where: { id: dayId },
      })
      
      if (day) {
        await prisma.day.update({
          where: { id: dayId },
          data: {
            wastedTotal: day.wastedTotal + parsed.duration,
          },
        })
      }
    }

    // Fetch the updated day with all entries
    const updatedDay = await prisma.day.findUnique({
      where: { id: dayId },
      include: {
        entries: {
          orderBy: {
            timestamp: 'asc',
          },
        },
      },
    })

    return NextResponse.json({ entry, day: updatedDay }, { status: 201 })
  } catch (error) {
    console.error('Error creating entry:', error)
    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    )
  }
}

// DELETE entry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const entryId = searchParams.get('entryId')

    if (!entryId) {
      return NextResponse.json(
        { error: 'entryId is required' },
        { status: 400 }
      )
    }

    // Get the entry before deleting to update day totals
    const entry = await prisma.logEntry.findUnique({
      where: { id: entryId },
    })

    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      )
    }

    // Delete the entry
    await prisma.logEntry.delete({
      where: { id: entryId },
    })

    // Update day totals if needed
    if (entry.type === 'signal' && entry.duration) {
      const day = await prisma.day.findUnique({
        where: { id: entry.dayId },
      })
      
      if (day) {
        await prisma.day.update({
          where: { id: entry.dayId },
          data: {
            signalTotal: Math.max(0, day.signalTotal - entry.duration),
          },
        })
      }
    } else if (entry.type === 'wasted' && entry.duration) {
      const day = await prisma.day.findUnique({
        where: { id: entry.dayId },
      })
      
      if (day) {
        await prisma.day.update({
          where: { id: entry.dayId },
          data: {
            wastedTotal: Math.max(0, day.wastedTotal - entry.duration),
          },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting entry:', error)
    return NextResponse.json(
      { error: 'Failed to delete entry' },
      { status: 500 }
    )
  }
}


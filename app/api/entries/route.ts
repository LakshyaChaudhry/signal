import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseLogEntry } from '@/lib/parser'

// GET entries by dayId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dayId = searchParams.get('dayId')
    const includeDrafts = searchParams.get('includeDrafts') === 'true'

    if (!dayId) {
      return NextResponse.json(
        { error: 'dayId is required' },
        { status: 400 }
      )
    }

    const entries = await prisma.logEntry.findMany({
      where: {
        dayId,
        ...(includeDrafts ? {} : { isDraft: false }),
      },
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
    const { dayId, content, timestamp, quality, duration, isDraft = false } = body

    if (!dayId || !content) {
      return NextResponse.json(
        { error: 'dayId and content are required' },
        { status: 400 }
      )
    }

    // Parse the entry content if not using quality system
    const parsed = parseLogEntry(content)
    
    // Determine type based on quality or parsed type
    let entryType = parsed.type
    let entryDuration = duration || parsed.duration
    
    // If quality is provided, determine type based on quality
    if (quality) {
      if (quality === 'deep' || quality === 'focused') {
        entryType = 'signal'
      } else if (quality === 'wasted' || quality === 'distracted') {
        entryType = 'wasted'
      } else {
        entryType = 'neutral'
      }
    }

    // Create the log entry
    const entry = await prisma.logEntry.create({
      data: {
        dayId,
        content: parsed.content,
        type: entryType,
        duration: entryDuration,
        quality: quality || null,
        isDraft,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      },
    })

    // Update day totals if not a draft and has duration
    if (!isDraft && entryDuration) {
      const day = await prisma.day.findUnique({
        where: { id: dayId },
      })
      
      if (day) {
        if (entryType === 'signal') {
          await prisma.day.update({
            where: { id: dayId },
            data: {
              signalTotal: day.signalTotal + entryDuration,
            },
          })
        } else if (entryType === 'wasted') {
          await prisma.day.update({
            where: { id: dayId },
            data: {
              wastedTotal: day.wastedTotal + entryDuration,
            },
          })
        }
      }
    }

    // Fetch the updated day with all entries
    const updatedDay = await prisma.day.findUnique({
      where: { id: dayId },
      include: {
        entries: {
          where: { isDraft: false },
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

// PATCH update entry (for completing drafts)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { entryId, content, quality, duration, isDraft } = body

    if (!entryId) {
      return NextResponse.json(
        { error: 'entryId is required' },
        { status: 400 }
      )
    }

    // Get existing entry
    const existingEntry = await prisma.logEntry.findUnique({
      where: { id: entryId },
    })

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      )
    }

    // Determine new type based on quality
    let entryType = existingEntry.type
    if (quality) {
      if (quality === 'deep' || quality === 'focused') {
        entryType = 'signal'
      } else if (quality === 'wasted' || quality === 'distracted') {
        entryType = 'wasted'
      } else {
        entryType = 'neutral'
      }
    }

    // Update the entry
    const updatedEntry = await prisma.logEntry.update({
      where: { id: entryId },
      data: {
        ...(content !== undefined && { content }),
        ...(quality !== undefined && { quality }),
        ...(duration !== undefined && { duration }),
        ...(isDraft !== undefined && { isDraft }),
        type: entryType,
      },
    })

    // If converting from draft to final, update day totals
    if (existingEntry.isDraft && isDraft === false && duration) {
      const day = await prisma.day.findUnique({
        where: { id: updatedEntry.dayId },
      })
      
      if (day) {
        if (entryType === 'signal') {
          await prisma.day.update({
            where: { id: updatedEntry.dayId },
            data: {
              signalTotal: day.signalTotal + duration,
            },
          })
        } else if (entryType === 'wasted') {
          await prisma.day.update({
            where: { id: updatedEntry.dayId },
            data: {
              wastedTotal: day.wastedTotal + duration,
            },
          })
        }
      }
    }

    // Fetch the updated day with all entries
    const updatedDay = await prisma.day.findUnique({
      where: { id: updatedEntry.dayId },
      include: {
        entries: {
          where: { isDraft: false },
          orderBy: {
            timestamp: 'asc',
          },
        },
      },
    })

    return NextResponse.json({ entry: updatedEntry, day: updatedDay })
  } catch (error) {
    console.error('Error updating entry:', error)
    return NextResponse.json(
      { error: 'Failed to update entry' },
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

    // Update day totals if needed (only for non-draft entries)
    if (!entry.isDraft && entry.duration) {
      const day = await prisma.day.findUnique({
        where: { id: entry.dayId },
      })
      
      if (day) {
        if (entry.type === 'signal') {
          await prisma.day.update({
            where: { id: entry.dayId },
            data: {
              signalTotal: Math.max(0, day.signalTotal - entry.duration),
            },
          })
        } else if (entry.type === 'wasted') {
          await prisma.day.update({
            where: { id: entry.dayId },
            data: {
              wastedTotal: Math.max(0, day.wastedTotal - entry.duration),
            },
          })
        }
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

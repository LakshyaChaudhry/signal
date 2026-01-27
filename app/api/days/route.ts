import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper to compute navigation IDs for a given day
async function getNavigationIds(dayId: string) {
  const allDays = await prisma.day.findMany({
    orderBy: { wakeTime: 'desc' },
    select: { id: true },
  })

  const currentIndex = allDays.findIndex(d => d.id === dayId)
  const previousDayId = (currentIndex >= 0 && currentIndex < allDays.length - 1)
    ? allDays[currentIndex + 1].id
    : null
  const nextDayId = (currentIndex > 0)
    ? allDays[currentIndex - 1].id
    : null

  return { previousDayId, nextDayId }
}

// GET current day (or most recent open day) or specific day by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dayId = searchParams.get('dayId')

    // If dayId provided, fetch that specific day
    if (dayId) {
      const day = await prisma.day.findUnique({
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
      
      if (!day) {
        return NextResponse.json({ error: 'Day not found' }, { status: 404 })
      }

      const { previousDayId, nextDayId } = await getNavigationIds(dayId)
      return NextResponse.json({ day, previousDayId, nextDayId })
    }
    
    // Otherwise, get current day (open or most recent)
    let currentDay = await prisma.day.findFirst({
      where: {
        sleepTime: null,
      },
      include: {
        entries: {
          where: { isDraft: false },
          orderBy: {
            timestamp: 'asc',
          },
        },
      },
    })

    // If no open day, get the most recent closed day
    if (!currentDay) {
      currentDay = await prisma.day.findFirst({
        orderBy: {
          wakeTime: 'desc',
        },
        include: {
          entries: {
            where: { isDraft: false },
            orderBy: {
              timestamp: 'asc',
            },
          },
        },
      })
    }
    
    // Get nav info if current day exists
    const navIds = currentDay ? await getNavigationIds(currentDay.id) : { previousDayId: null, nextDayId: null }
    return NextResponse.json({ day: currentDay, ...navIds })
  } catch (error) {
    console.error('Error fetching current day:', error)
    return NextResponse.json(
      { error: 'Failed to fetch current day' },
      { status: 500 }
    )
  }
}

// POST create new day OR reopen existing day
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wakeTime } = body

    if (!wakeTime) {
      return NextResponse.json(
        { error: 'wakeTime is required' },
        { status: 400 }
      )
    }

    // Validate: wake time cannot be in the future
    const wakeDate = new Date(wakeTime)
    const now = new Date()
    if (wakeDate > now) {
      return NextResponse.json(
        { error: 'Cannot create a day in the future' },
        { status: 400 }
      )
    }

    // Check if there's already an open day
    const existingOpenDay = await prisma.day.findFirst({
      where: {
        sleepTime: null,
      },
      include: {
        entries: {
          where: { isDraft: false },
          orderBy: {
            timestamp: 'asc',
          },
        },
      },
    })

    // If there's an open day, return it instead of creating a new one
    if (existingOpenDay) {
      const { previousDayId, nextDayId } = await getNavigationIds(existingOpenDay.id)
      return NextResponse.json({
        day: existingOpenDay,
        previousDayId,
        nextDayId,
        reopened: true
      }, { status: 200 })
    }

    // Get the most recent day to check its date
    const mostRecentDay = await prisma.day.findFirst({
      orderBy: {
        wakeTime: 'desc',
      },
      select: {
        id: true,
        wakeTime: true,
        sleepTime: true,
      },
    })

    // Check if the most recent day is from today
    if (mostRecentDay) {
      const mostRecentWakeDate = new Date(mostRecentDay.wakeTime)
      const todayStart = new Date(now)
      todayStart.setHours(0, 0, 0, 0)
      
      // If the most recent day was created today, reopen it instead of creating a new one
      if (mostRecentWakeDate >= todayStart && mostRecentDay.sleepTime) {
        // Reopen the day by clearing its sleepTime
        const reopenedDay = await prisma.day.update({
          where: { id: mostRecentDay.id },
          data: {
            sleepTime: null,
            wakeTime: new Date(wakeTime), // Update wake time to now
          },
          include: {
            entries: {
              where: { isDraft: false },
              orderBy: {
                timestamp: 'asc',
              },
            },
          },
        })

        const { previousDayId, nextDayId } = await getNavigationIds(reopenedDay.id)
        return NextResponse.json({
          day: reopenedDay,
          previousDayId,
          nextDayId,
          reopened: true
        }, { status: 200 })
      }
    }

    // No existing open day and no today day to reopen, create a new one
    // But first close any other open days (shouldn't happen but just in case)
    await prisma.day.updateMany({
      where: {
        sleepTime: null,
      },
      data: {
        sleepTime: new Date(wakeTime),
      },
    })

    // Create new day
    const newDay = await prisma.day.create({
      data: {
        wakeTime: new Date(wakeTime),
      },
      include: {
        entries: {
          where: { isDraft: false },
        },
      },
    })

    const { previousDayId, nextDayId } = await getNavigationIds(newDay.id)
    return NextResponse.json({ day: newDay, previousDayId, nextDayId }, { status: 201 })
  } catch (error) {
    console.error('Error creating day:', error)
    return NextResponse.json(
      { error: 'Failed to create day' },
      { status: 500 }
    )
  }
}

// PATCH update day (to close it, update totals, or update wake time)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { dayId, sleepTime, signalTotal, wastedTotal, wakeTime } = body

    if (!dayId) {
      return NextResponse.json(
        { error: 'dayId is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (sleepTime !== undefined) updateData.sleepTime = new Date(sleepTime)
    if (signalTotal !== undefined) updateData.signalTotal = signalTotal
    if (wastedTotal !== undefined) updateData.wastedTotal = wastedTotal
    if (wakeTime !== undefined) updateData.wakeTime = new Date(wakeTime)

    const updatedDay = await prisma.day.update({
      where: { id: dayId },
      data: updateData,
      include: {
        entries: {
          where: { isDraft: false },
          orderBy: {
            timestamp: 'asc',
          },
        },
      },
    })

    const { previousDayId, nextDayId } = await getNavigationIds(updatedDay.id)
    return NextResponse.json({ day: updatedDay, previousDayId, nextDayId })
  } catch (error) {
    console.error('Error updating day:', error)
    return NextResponse.json(
      { error: 'Failed to update day' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
      
      // BUG FIX: Validate day exists before computing navigation
      if (!day) {
        return NextResponse.json({ 
          error: 'Day not found' 
        }, { status: 404 })
      }
      
      // Get all days sorted by wake time for navigation
      const allDays = await prisma.day.findMany({
        orderBy: { wakeTime: 'desc' },
        select: { id: true, wakeTime: true },
      })
      
      // Find current day index and determine prev/next
      const currentIndex = allDays.findIndex(d => d.id === dayId)
      
      // BUG FIX: Validate index before accessing array
      const previousDayId = (currentIndex >= 0 && currentIndex < allDays.length - 1) 
        ? allDays[currentIndex + 1].id 
        : null
      const nextDayId = (currentIndex > 0) 
        ? allDays[currentIndex - 1].id 
        : null
      
      return NextResponse.json({ 
        day, 
        previousDayId,
        nextDayId 
      })
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
    let previousDayId = null
    let nextDayId = null
    
    if (currentDay) {
      const allDays = await prisma.day.findMany({
        orderBy: { wakeTime: 'desc' },
        select: { id: true, wakeTime: true },
      })
      
      const currentIndex = allDays.findIndex(d => d.id === currentDay!.id)
      previousDayId = currentIndex < allDays.length - 1 ? allDays[currentIndex + 1].id : null
      nextDayId = currentIndex > 0 ? allDays[currentIndex - 1].id : null
    }

    return NextResponse.json({ day: currentDay, previousDayId, nextDayId })
  } catch (error) {
    console.error('Error fetching current day:', error)
    return NextResponse.json(
      { error: 'Failed to fetch current day' },
      { status: 500 }
    )
  }
}

// POST create new day
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

    // Close any open days before creating a new one
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

    // BUG FIX: Compute navigation IDs for new day
    const allDays = await prisma.day.findMany({
      orderBy: { wakeTime: 'desc' },
      select: { id: true, wakeTime: true },
    })
    
    const currentIndex = allDays.findIndex(d => d.id === newDay.id)
    const previousDayId = (currentIndex >= 0 && currentIndex < allDays.length - 1) 
      ? allDays[currentIndex + 1].id 
      : null
    const nextDayId = (currentIndex > 0) 
      ? allDays[currentIndex - 1].id 
      : null

    return NextResponse.json({ 
      day: newDay,
      previousDayId,
      nextDayId
    }, { status: 201 })
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

    // BUG FIX: Compute navigation IDs after update
    const allDays = await prisma.day.findMany({
      orderBy: { wakeTime: 'desc' },
      select: { id: true, wakeTime: true },
    })
    
    const currentIndex = allDays.findIndex(d => d.id === updatedDay.id)
    const previousDayId = (currentIndex >= 0 && currentIndex < allDays.length - 1) 
      ? allDays[currentIndex + 1].id 
      : null
    const nextDayId = (currentIndex > 0) 
      ? allDays[currentIndex - 1].id 
      : null

    return NextResponse.json({ 
      day: updatedDay,
      previousDayId,
      nextDayId
    })
  } catch (error) {
    console.error('Error updating day:', error)
    return NextResponse.json(
      { error: 'Failed to update day' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET current day (or most recent open day)
export async function GET(request: NextRequest) {
  try {
    // Look for a day that doesn't have a sleep time (still open)
    let currentDay = await prisma.day.findFirst({
      where: {
        sleepTime: null,
      },
      include: {
        entries: {
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
            orderBy: {
              timestamp: 'asc',
            },
          },
        },
      })
    }

    return NextResponse.json({ day: currentDay })
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
        entries: true,
      },
    })

    return NextResponse.json({ day: newDay }, { status: 201 })
  } catch (error) {
    console.error('Error creating day:', error)
    return NextResponse.json(
      { error: 'Failed to create day' },
      { status: 500 }
    )
  }
}

// PATCH update day (to close it or update totals)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { dayId, sleepTime, signalTotal, wastedTotal } = body

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

    const updatedDay = await prisma.day.update({
      where: { id: dayId },
      data: updateData,
      include: {
        entries: {
          orderBy: {
            timestamp: 'asc',
          },
        },
      },
    })

    return NextResponse.json({ day: updatedDay })
  } catch (error) {
    console.error('Error updating day:', error)
    return NextResponse.json(
      { error: 'Failed to update day' },
      { status: 500 }
    )
  }
}


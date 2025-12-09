/**
 * Script to identify and clean up duplicate days
 * This happens when multiple days are created for the same calendar date
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface DayInfo {
  id: string
  wakeTime: Date
  sleepTime: Date | null
  signalTotal: number
  wastedTotal: number
  entryCount: number
}

interface DayGroup {
  date: string
  days: DayInfo[]
}

async function analyzeDuplicateDays() {
  console.log('\n📊 Analyzing days for duplicates...\n')

  // Fetch all days with entry counts
  const days = await prisma.day.findMany({
    include: {
      _count: {
        select: { entries: true }
      },
      entries: {
        where: { isDraft: false }
      }
    },
    orderBy: {
      wakeTime: 'desc'
    }
  })

  // Group days by calendar date
  const daysByDate = new Map<string, DayInfo[]>()
  
  for (const day of days) {
    const wakeDate = new Date(day.wakeTime)
    const dateKey = wakeDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
    
    const dayInfo: DayInfo = {
      id: day.id,
      wakeTime: day.wakeTime,
      sleepTime: day.sleepTime,
      signalTotal: day.signalTotal,
      wastedTotal: day.wastedTotal,
      entryCount: day._count.entries
    }
    
    if (!daysByDate.has(dateKey)) {
      daysByDate.set(dateKey, [])
    }
    daysByDate.get(dateKey)!.push(dayInfo)
  }

  // Find duplicates (dates with more than one day)
  const duplicates: DayGroup[] = []
  
  for (const [date, daysInDate] of daysByDate.entries()) {
    if (daysInDate.length > 1) {
      duplicates.push({ date, days: daysInDate })
    }
  }

  if (duplicates.length === 0) {
    console.log('✅ No duplicate days found!')
    return []
  }

  console.log(`⚠️  Found ${duplicates.length} date(s) with duplicate days:\n`)

  for (const group of duplicates) {
    console.log(`📅 ${group.date} (${group.days.length} days):`)
    group.days.forEach((day, idx) => {
      const status = day.sleepTime ? '🔒 CLOSED' : '🔓 OPEN'
      const wake = day.wakeTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      })
      const sleep = day.sleepTime 
        ? day.sleepTime.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit' 
          })
        : 'ongoing'
      
      console.log(`  ${idx + 1}. ${status} | ID: ${day.id.substring(0, 8)}... | ${wake} → ${sleep}`)
      console.log(`     Entries: ${day.entryCount} | Signal: ${day.signalTotal}min | Wasted: ${day.wastedTotal}min`)
    })
    console.log()
  }

  return duplicates
}

async function cleanupDuplicateDays(duplicates: DayGroup[], dryRun = true) {
  if (duplicates.length === 0) {
    console.log('No duplicates to clean up.')
    return
  }

  console.log(dryRun ? '\n🔍 DRY RUN - No changes will be made\n' : '\n🗑️  CLEANING UP DUPLICATES\n')

  for (const group of duplicates) {
    console.log(`\n📅 Processing ${group.date}:`)
    
    // Sort days by wake time (most recent first)
    const sortedDays = [...group.days].sort((a, b) => 
      b.wakeTime.getTime() - a.wakeTime.getTime()
    )

    // Keep the most recent day with the most entries
    let keepDay = sortedDays[0]
    
    // If the first day has no entries but another does, keep the one with entries
    for (const day of sortedDays) {
      if (day.entryCount > keepDay.entryCount) {
        keepDay = day
        break
      }
    }

    console.log(`  ✅ KEEP: ${keepDay.id.substring(0, 8)}... (${keepDay.entryCount} entries)`)

    // Delete the others
    for (const day of sortedDays) {
      if (day.id !== keepDay.id) {
        console.log(`  ❌ DELETE: ${day.id.substring(0, 8)}... (${day.entryCount} entries)`)
        
        if (!dryRun) {
          await prisma.day.delete({
            where: { id: day.id }
          })
          console.log(`     Deleted!`)
        }
      }
    }
  }

  if (dryRun) {
    console.log('\n💡 This was a dry run. Run with --cleanup to actually delete.')
  } else {
    console.log('\n✅ Cleanup complete!')
  }
}

async function main() {
  const args = process.argv.slice(2)
  const shouldCleanup = args.includes('--cleanup')

  try {
    const duplicates = await analyzeDuplicateDays()
    
    if (duplicates.length > 0) {
      await cleanupDuplicateDays(duplicates, !shouldCleanup)
    }
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

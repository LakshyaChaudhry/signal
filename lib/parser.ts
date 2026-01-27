import { ParsedEntry } from '@/types'

/**
 * Parse log entry content to extract type and duration
 * 
 * Supported tags:
 * - [wake] - Marks wake-up time
 * - [sleep] - Marks sleep time
 * - [signal: X] - High-signal work time in minutes
 * - [wasted: X] - Wasted time in minutes
 * 
 * Examples:
 * - "9:30am woke up [wake]"
 * - "10-12 worked on research [signal: 120]"
 * - "wasted 45min on twitter [wasted: 45]"
 * - "sleep at 2am [sleep]"
 */
export function parseLogEntry(content: string): ParsedEntry {
  const trimmedContent = content.trim()
  
  // Check for wake tag
  if (/\[wake\]/i.test(trimmedContent)) {
    return {
      type: 'wake',
      duration: null,
      content: trimmedContent,
    }
  }
  
  // Check for sleep tag
  if (/\[sleep\]/i.test(trimmedContent)) {
    return {
      type: 'sleep',
      duration: null,
      content: trimmedContent,
    }
  }
  
  // Check for signal tag with duration
  const signalMatch = trimmedContent.match(/\[signal:\s*(\d+)\]/i)
  if (signalMatch) {
    return {
      type: 'signal',
      duration: parseInt(signalMatch[1], 10),
      content: trimmedContent,
    }
  }
  
  // Check for wasted tag with duration
  const wastedMatch = trimmedContent.match(/\[wasted:\s*(\d+)\]/i)
  if (wastedMatch) {
    return {
      type: 'wasted',
      duration: parseInt(wastedMatch[1], 10),
      content: trimmedContent,
    }
  }
  
  // Default to neutral if no tags found
  return {
    type: 'neutral',
    duration: null,
    content: trimmedContent,
  }
}

/**
 * Detect if content contains wake-related keywords
 * Used to prompt user for day boundary confirmation
 */
export function containsWakeKeywords(content: string): boolean {
  const wakeKeywords = /\b(woke|wake|waking|got up|morning)\b/i
  return wakeKeywords.test(content) || /\[wake\]/i.test(content)
}

/**
 * Detect if content contains sleep-related keywords
 * Used to prompt user for day boundary confirmation
 */
export function containsSleepKeywords(content: string): boolean {
  const sleepKeywords = /\b(sleep|sleeping|slept|bed|goodnight|gn)\b/i
  return sleepKeywords.test(content) || /\[sleep\]/i.test(content)
}

/**
 * Format minutes to HH:MM format
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}:${mins.toString().padStart(2, '0')}`
}


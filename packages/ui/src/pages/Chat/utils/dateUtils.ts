/**
 * Formats a timestamp for display in the UI
 *
 * For messages from today: displays the time (e.g., "2:30 PM")
 * For messages from yesterday: displays "Yesterday"
 * For messages from this week: displays the day of week (e.g., "Monday")
 * For older messages: displays the date (e.g., "Jan 15")
 *
 * @param timestamp ISO date string
 * @returns Formatted timestamp string
 */
export const formatMessageTimestamp = (timestamp: string): string => {
  if (!timestamp) return ''

  const date = new Date(timestamp)
  const now = new Date()

  // Check if invalid date
  if (isNaN(date.getTime())) return ''

  // Today: show time
  if (isSameDay(date, now)) {
    return formatTime(date)
  }

  // Yesterday: show "Yesterday"
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (isSameDay(date, yesterday)) {
    return 'Yesterday'
  }

  // This week: show day name
  if (isThisWeek(date, now)) {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  // This year: show month and day
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Different year: show month, day and year
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * Checks if two dates are the same day
 */
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * Checks if a date is within the current week
 */
const isThisWeek = (date: Date, now: Date): boolean => {
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay()) // Start of week (Sunday)
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6) // End of week (Saturday)
  endOfWeek.setHours(23, 59, 59, 999)

  return date >= startOfWeek && date <= endOfWeek
}

/**
 * Formats a date to a time string (e.g., "2:30 PM")
 */
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

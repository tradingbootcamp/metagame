export const dateUtils = {
  /** e.g. "2025-08-14T16:00:00.000Z" -> "2025-08-14T09:00:00.000Z" */
  stringTimestampToPSTString: (timestamp: string) => {
    const utcDate = new Date(timestamp)
    // Create a new date in PST by converting from UTC
    return utcDate.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })
  },

  /** Returns the number of minutes since midnight in PST */
  getPSTMinutes: (timestamp: string) => {
    const date = new Date(timestamp)
    const parts = dateUtils.getPacificParts(date)
    return Number(parts.hour) * 60 + Number(parts.minute)
  },
  getStringDate: (timestamp: string) => {
    const parts = dateUtils.getPacificParts(new Date(timestamp))
    return `${parts.weekday}, ${parts.month} ${parts.day}, ${parts.year}`
  },
  getStringTime: (timestamp: string) => {
    const parts = dateUtils.getPacificParts(new Date(timestamp))
    return `${parts.hour}:${parts.minute}`
  },

  getYYYYMMDD: (date: Date) => {
    return YMD_PACIFIC.format(date)
  },

  /** e.g. day: "14", hour: "20", minute: "36", month: "08", weekday: "Thu", year: "2025" */
  getPacificParts: (date: Date) => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(date)

    // Turn into a simple object { year, month, day, weekday, hour, minute }
    return Object.fromEntries(
      parts.filter((p) => p.type !== 'literal').map((p) => [p.type, p.value]),
    )
  },

  dateFromParts: (parts: {
    year: number | string
    month: number | string
    day: number | string
    time?: string
    hour?: number | string
    minute?: number | string
    timezone?: number | string // hours from UTC, e.g. -7
  }) => {
    const { year, month, day, time, hour, minute, timezone = -7 } = parts

    const [h, m] = time
      ? time.split(':').map(Number)
      : [Number(hour), Number(minute)]

    const y = Number(year)
    const mo = Number(month) - 1 // Month is 0-indexed
    const d = Number(day)
    const tz = Number(timezone)
    console.log(tz)
    const tzString =
      tz >= 0
        ? `+${tz.toString().padStart(2, '0')}:00`
        : `-${Math.abs(tz).toString().padStart(2, '0')}:00`
    // Create a date string in ISO format
    console.log('tzString', tzString)
    const dateString = `${y.toString().padStart(4, '0')}-${(mo + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}T${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}${tzString}`
    console.log('dateString', dateString)
    // Create a date and interpret it as Pacific time
    return new Date(dateString)
  },

  /**
   * Creates a Date object for a specific time in PST today
   */
  todayAtPST: (hour: number, minute: number = 0) => {
    const now = new Date()
    const todayParts = dateUtils.getPacificParts(now)

    return dateUtils.dateFromParts({
      year: todayParts.year,
      month: todayParts.month,
      day: todayParts.day,
      hour,
      minute,
    })
  },

  /**
   * Gets the current time in PST as a Date object
   */
  nowInPST: () => {
    const now = new Date()
    const parts = dateUtils.getPacificParts(now)

    return dateUtils.dateFromParts({
      year: parts.year,
      month: parts.month,
      day: parts.day,
      hour: parts.hour,
      minute: parts.minute,
    })
  },

  /**
   * Formats a date to show time in PST
   */
  formatPST: (date: Date, options?: Intl.DateTimeFormatOptions) => {
    return date.toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
      ...options,
    })
  },
}

const YMD_PACIFIC = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Los_Angeles',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

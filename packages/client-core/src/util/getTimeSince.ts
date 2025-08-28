const SECOND = 1
const MINUTE = SECOND * 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24
const WEEK = DAY * 7
const MONTH = DAY * 30
const YEAR = DAY * 365

const intervals = [
  {
    label: 'year',
    interval: YEAR,
    roundUp: true,
    firstRoundUp: true
  },
  {
    label: 'month',
    interval: MONTH,
    roundUp: true,
    firstRoundUp: false
  },
  {
    label: 'week',
    interval: WEEK,
    roundUp: true,
    firstRoundUp: false
  },
  {
    label: 'day',
    interval: DAY,
    roundUp: true,
    firstRoundUp: false
  },
  {
    label: 'hour',
    interval: HOUR,
    roundUp: true,
    firstRoundUp: false
  },
  {
    label: 'minute',
    interval: MINUTE,
    roundUp: true,
    firstRoundUp: false
  },
  {
    label: 'second',
    interval: SECOND,
    roundUp: true,
    firstRoundUp: true
  }
]

export function getTimeSince(dateStr: string | Date | number) {
  const date = new Date(dateStr)
  const now = new Date()
  const timeDifference = Math.floor((now.getTime() - date.getTime()) / 1000) // in seconds

  for (let i = 0; i < intervals.length; i++) {
    const { label, interval } = intervals[i]
    let count = Math.floor(timeDifference / interval)

    if (label === 'second' && count < 30) {
      return 'just now'
    }

    const remainder = timeDifference % interval

    if (count >= 1 && i < intervals.length - 1 && intervals[i + 1].roundUp && remainder >= interval / 2) {
      count++
    } else if (count < 1 && i < intervals.length - 1 && intervals[i + 1].firstRoundUp && remainder >= interval / 2) {
      count++
    }

    if (i > 0 && count * interval === intervals[i - 1].interval) {
      return `1 ${intervals[i - 1].label} ${intervals[i - 1].interval > 1 ? 's' : ''} ago`
    }

    if (count >= 1) {
      return `${count.toLocaleString()} ${label}${count > 1 ? 's' : ''} ago`
    }
  }

  return 'just now'
}

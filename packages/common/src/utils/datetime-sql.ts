// https://stackoverflow.com/a/11150727
export const getDateTimeSql = async () => {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

export const toDateTimeSql = (date: Date) => {
  return date.toISOString().slice(0, 19).replace('T', ' ')
}

export const toDisplayDateTime = (date: string | null | undefined) => {
  return date
    ? new Date(date).toLocaleString('en-us', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      })
    : '-'
}

export const toDisplayDateTimeUtc = (date: string | null | undefined) => {
  return date ? new Date(date).toISOString().slice(0, 19).replace('T', ' ') : '-'
}

// https://stackoverflow.com/a/11150727
export const fromDateTimeSql = (date: string) => {
  const dateObj = new Date(date)

  return (
    dateObj.getFullYear() +
    '-' +
    ('00' + (dateObj.getMonth() + 1)).slice(-2) +
    '-' +
    ('00' + dateObj.getDate()).slice(-2) +
    'T' +
    ('00' + dateObj.getHours()).slice(-2) +
    ':' +
    ('00' + dateObj.getMinutes()).slice(-2) +
    ':' +
    ('00' + dateObj.getSeconds()).slice(-2) +
    '.000Z'
  )
}

export const convertDateTimeSqlToLocal = (dateSql: string) => {
  const date = new Date(dateSql)

  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export const timeAgo = (date: Date) => {
  const now = Date.now()

  const difference = now - date.getTime()

  const seconds = Math.floor(difference / 1000) % 60
  const minutes = Math.floor(difference / (1000 * 60)) % 60
  const hours = Math.floor(difference / (1000 * 60 * 60)) % 24
  const days = Math.floor(difference / (1000 * 60 * 60 * 24))

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`
  }
  if (seconds > 0) {
    return `${seconds} second${seconds > 1 ? 's' : ''}`
  }

  return ''
}

export const formatDateToMMDDYY = (timestamp: number): string => {
  const date = new Date(timestamp * 1000)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const year = date.getFullYear().toString().slice(-2)
  return `${month}/${day}/${year}`
}

import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'

export function formatDate(date, pattern = 'MMM d, yyyy') {
  if (!date) return ''
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return ''
  return format(d, pattern)
}

export function formatDateTime(date) {
  return formatDate(date, 'MMM d, yyyy · h:mm a')
}

export function timeAgo(date) {
  if (!date) return ''
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return ''
  return formatDistanceToNow(d, { addSuffix: true })
}

export function formatShortDate(date) {
  return formatDate(date, 'dd/MM/yy')
}

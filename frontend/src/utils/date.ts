export function toDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function today(): string {
  return toDateInputValue(new Date())
}

export function daysAgo(count: number): string {
  const date = new Date()
  date.setDate(date.getDate() - count)
  return toDateInputValue(date)
}

export function daysBetween(from: string, to: string): number {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / msPerDay)
}

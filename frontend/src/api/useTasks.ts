import { useQuery } from '@tanstack/react-query'
import { apiFetch } from './client'
import type { ApiTasksGroupedByStatus } from './types'

export function useTasksByStatus(userEmails: string[], from: number, to: number) {
  return useQuery({
    queryKey: ['tasks', 'by-status', userEmails, from, to],
    queryFn: () => {
      const params = new URLSearchParams()
      for (const email of userEmails) {
        params.append('userEmail', email)
      }
      params.set('from', String(from))
      params.set('to', String(to))

      return apiFetch<ApiTasksGroupedByStatus>(`/tasks/by-status?${params.toString()}`)
    },
    enabled: false,
  })
}

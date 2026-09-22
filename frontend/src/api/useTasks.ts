import { useQuery } from '@tanstack/react-query'
import { apiFetch } from './client'
import type { ApiTasksGroupedByStatus } from './types'

export function useTasksByStatus(userEmail: string, from: number, to: number) {
  return useQuery({
    queryKey: ['tasks', 'by-status', userEmail, from, to],
    queryFn: () =>
      apiFetch<ApiTasksGroupedByStatus>(
        `/tasks/by-status?userEmail=${encodeURIComponent(userEmail)}&from=${from}&to=${to}`,
      ),
    enabled: false,
  })
}

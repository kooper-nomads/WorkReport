import { useQuery } from '@tanstack/react-query'
import { apiFetch } from './client'
import type { ApiAssignedTask } from './types'

export function useAssignedTasks(userId: number, from: number, to: number) {
  return useQuery({
    queryKey: ['assigned-tasks', userId, from, to],
    queryFn: () => apiFetch<ApiAssignedTask[]>(`/assigned-tasks?userId=${userId}&from=${from}&to=${to}`),
    enabled: false,
  })
}

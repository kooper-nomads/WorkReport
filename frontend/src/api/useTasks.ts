import { useQuery } from '@tanstack/react-query'
import { apiFetch } from './client'
import type { ApiAssignedTask } from './types'

export function useActiveTasks(userEmail: string) {
  return useQuery({
    queryKey: ['tasks', 'active', userEmail],
    queryFn: () => apiFetch<ApiAssignedTask[]>(`/tasks/active?userEmail=${encodeURIComponent(userEmail)}`),
    enabled: false,
  })
}

export function useDoneTasks(userEmail: string, from: number, to: number) {
  return useQuery({
    queryKey: ['tasks', 'done', userEmail, from, to],
    queryFn: () =>
      apiFetch<ApiAssignedTask[]>(`/tasks/done?userEmail=${encodeURIComponent(userEmail)}&from=${from}&to=${to}`),
    enabled: false,
  })
}

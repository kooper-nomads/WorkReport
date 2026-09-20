import { useQuery } from '@tanstack/react-query'
import { apiFetch } from './client'
import type { Task } from '../types/task'

export function useReport(userId: number, days: number) {
  return useQuery({
    queryKey: ['report', userId, days],
    queryFn: () => apiFetch<Task[]>(`/report?userId=${userId}&days=${days}`),
    enabled: false,
  })
}

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from './client'
import type { ApiUser } from './types'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiFetch<ApiUser[]>('/users'),
  })
}

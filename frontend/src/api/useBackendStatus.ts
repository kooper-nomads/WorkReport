import { useQuery } from '@tanstack/react-query'
import { apiFetch } from './client'

export function useBackendStatus() {
  return useQuery({
    queryKey: ['backend-status'],
    queryFn: () => apiFetch<string>('/'),
    retry: 1,
  })
}

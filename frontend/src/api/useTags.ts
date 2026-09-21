import { useQuery } from '@tanstack/react-query'
import { apiFetch } from './client'
import type { ApiTag } from './types'

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => apiFetch<ApiTag[]>('/tags'),
  })
}

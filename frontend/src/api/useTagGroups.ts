import { useQuery } from '@tanstack/react-query'
import { apiFetch } from './client'
import type { ApiTagGroup } from './types'

export function useTagGroups() {
  return useQuery({
    queryKey: ['tag-groups'],
    queryFn: () => apiFetch<ApiTagGroup[]>('/tags/groups'),
  })
}

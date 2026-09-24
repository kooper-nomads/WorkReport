export interface ApiUser {
  id: number
  email: string
  name: string
}

export interface ApiAssignedTask {
  id: number
  name: string
  status: 'active' | 'done'
  statusTag: string | null
  project: { id: number; name: string }
  author: { id: string; name: string }
  assignee: { id: string; name: string }
  tags: { id: string; label: string }[]
  createdAt: string
  completedAt?: string | null
}

export interface ApiTasksGroupedByStatus {
  todo: ApiAssignedTask[]
  in_progress: ApiAssignedTask[]
  done: ApiAssignedTask[]
}

export interface ApiAuthStatus {
  authMethod: 'api_key' | 'oauth'
  connected: boolean
  connection?: {
    email: string
    firstName: string
    lastName: string
    accountUrl: string
  }
}

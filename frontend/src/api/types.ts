export interface ApiUser {
  id: number
  email: string
  name: string
}

export interface ApiTagGroup {
  id: number
  title: string
}

export interface ApiTag {
  id: number
  title: string
  group: ApiTagGroup
}

export interface ApiAssignedTask {
  id: number
  name: string
  status: 'active' | 'done'
  project: { id: number; name: string }
  assignee: { id: string; name: string }
  tags: { id: string; label: string }[]
}

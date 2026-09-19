export type TaskStatus = 'new' | 'in_progress' | 'review' | 'done' | 'overdue'

export interface TaskUser {
  id: string
  name: string
  avatarUrl?: string
}

export interface TaskTag {
  id: string
  label: string
  color?: string
}

export interface Task {
  id: string | number
  name: string
  status: TaskStatus
  author: TaskUser
  assignee: TaskUser
  tags: TaskTag[]
}

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

export type TaskEventAction = 'post' | 'update' | 'close'

export interface TaskEvent {
  id: string
  action: TaskEventAction
  date: string
  userFrom: string
  summary: string
}

export interface Task {
  id: string | number
  name: string
  status: TaskStatus
  author: TaskUser
  assignee: TaskUser
  tags: TaskTag[]
  events: TaskEvent[]
}

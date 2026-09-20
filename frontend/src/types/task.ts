export type TaskStatus = 'active' | 'done'

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

export interface TaskEvent {
  id: string
  type: 'task' | 'comment'
  action: string
  date: string
  userFrom: string
  summary: string
}

export interface TaskParent {
  id: string | number
  name: string
}

export interface Task {
  id: string | number
  name: string
  status: TaskStatus
  author: TaskUser
  assignee: TaskUser
  tags: TaskTag[]
  events: TaskEvent[]
  parent?: TaskParent
}

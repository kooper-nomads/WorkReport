import type { TaskStatus } from '../types/task'

export const TASK_STATUS_ORDER: TaskStatus[] = ['new', 'in_progress', 'review', 'done', 'overdue']

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  new: 'Нова',
  in_progress: 'В роботі',
  review: 'На перевірці',
  done: 'Завершена',
  overdue: 'Прострочена',
}

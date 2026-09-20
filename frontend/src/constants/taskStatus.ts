import type { TaskStatus } from '../types/task'

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  active: 'В роботі',
  done: 'Завершена',
}

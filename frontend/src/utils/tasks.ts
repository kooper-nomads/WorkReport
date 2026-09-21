import type { Task } from '../types/task'

export interface TaskTagGroup {
  id: string
  label: string
  tasks: Task[]
}

export const UNTAGGED_GROUP_ID = 'untagged'

export function groupTasksByTag(tasks: Task[]): TaskTagGroup[] {
  const groups = new Map<string, TaskTagGroup>()
  const untagged: Task[] = []

  for (const task of tasks) {
    if (task.tags.length === 0) {
      untagged.push(task)
      continue
    }

    for (const tag of task.tags) {
      const group = groups.get(tag.id) ?? { id: tag.id, label: tag.label, tasks: [] }
      group.tasks.push(task)
      groups.set(tag.id, group)
    }
  }

  const sortedGroups = [...groups.values()].sort((a, b) => a.label.localeCompare(b.label))

  if (untagged.length > 0) {
    sortedGroups.push({ id: UNTAGGED_GROUP_ID, label: 'Без тегів', tasks: untagged })
  }

  return sortedGroups
}

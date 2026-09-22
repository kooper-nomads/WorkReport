import { useMemo } from 'react'
import type { Task, TaskStatusGroup } from '../../types/task'
import { groupTasksByTag, UNTAGGED_GROUP_ID } from '../../utils/tasks'
import { TaskCard } from '../TaskCard/TaskCard'
import './TaskColumn.css'

interface TaskColumnProps {
  title: string
  group: TaskStatusGroup
  tasks: Task[]
  isLoaded: boolean
}

export function TaskColumn({ title, group, tasks, isLoaded }: TaskColumnProps) {
  const tagGroups = useMemo(() => groupTasksByTag(tasks), [tasks])

  return (
    <div className={`task-column task-column--${group}`}>
      <div className="task-column__header">
        <h2 className="task-column__title">{title}</h2>
        <span className="task-column__count">{tasks.length}</span>
      </div>
      <div className="task-column__body">
        {tagGroups.map((group) => (
          <div key={group.id} className="task-column__tag-group">
            <div className="task-column__tag-group-header">
              <span
                className={
                  group.id === UNTAGGED_GROUP_ID
                    ? 'task-column__tag-group-label task-column__tag-group-label--untagged'
                    : 'task-column__tag-group-label'
                }
              >
                {group.label}
              </span>
              <span className="task-column__tag-group-count">{group.tasks.length}</span>
            </div>
            <div className="task-column__cards">
              {group.tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        ))}
        {isLoaded && tasks.length === 0 && <p className="task-column__empty">Немає задач</p>}
      </div>
    </div>
  )
}

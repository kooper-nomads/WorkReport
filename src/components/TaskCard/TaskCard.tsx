import type { CSSProperties } from 'react'
import { TASK_STATUS_LABELS } from '../../constants/taskStatus'
import type { Task, TaskUser } from '../../types/task'
import './TaskCard.css'

interface TaskCardProps {
  task: Task
}

function UserBadge({ label, user }: { label: string; user: TaskUser }) {
  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return (
    <div className="task-card__user">
      <span className="task-card__user-label">{label}</span>
      <span className="task-card__user-value">
        {user.avatarUrl ? (
          <img className="task-card__avatar" src={user.avatarUrl} alt="" />
        ) : (
          <span className="task-card__avatar task-card__avatar--initials">{initials}</span>
        )}
        {user.name}
      </span>
    </div>
  )
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <article className="task-card">
      <header className="task-card__header">
        <span className="task-card__id">#{task.id}</span>
        <span className={`task-card__status task-card__status--${task.status}`}>
          {TASK_STATUS_LABELS[task.status]}
        </span>
      </header>

      <h3 className="task-card__name">{task.name}</h3>

      <div className="task-card__users">
        <UserBadge label="Від" user={task.author} />
        <UserBadge label="Кому" user={task.assignee} />
      </div>

      {task.tags.length > 0 && (
        <ul className="task-card__tags">
          {task.tags.map((tag) => (
            <li
              key={tag.id}
              className="task-card__tag"
              style={tag.color ? ({ '--tag-color': tag.color } as CSSProperties) : undefined}
            >
              {tag.label}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

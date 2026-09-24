import type { CSSProperties } from 'react'
import type { Task, TaskEvent, TaskUser } from '../../types/task'
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

function EventRow({ event }: { event: TaskEvent }) {
  const variant = event.type === 'comment' ? 'comment' : event.action
  return (
    <li className={`task-card__event task-card__event--${variant}`}>
      <span className="task-card__event-dot" />
      <div className="task-card__event-body">
        <span className="task-card__event-summary">{event.summary}</span>
        <span className="task-card__event-meta">
          {event.date} · {event.userFrom}
        </span>
      </div>
    </li>
  )
}

const formatDate = (date?: string | null) =>
  date
    ? new Date(date).toLocaleString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

export function TaskCard({ task }: TaskCardProps) {
  const otherTags = task.tags.filter((tag) => tag.label !== task.statusTag)

  return (
    <article className="task-card">
      <header className="task-card__header">
        <span className="task-card__id">#{task.id}</span>
        {task.statusTag && <span className="task-card__status">{task.statusTag}</span>}
      </header>

      <h3 className="task-card__name">{task.name}</h3>

      {task.project && <span className="task-card__project">{task.project.name}</span>}

      <div className="task-card__users">
        {task.author && <UserBadge label="Від" user={task.author} />}
        <UserBadge label="Кому" user={task.assignee} />
      </div>

      {otherTags.length > 0 && (
        <ul className="task-card__tags">
          {otherTags.map((tag) => (
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

      {task.events.length > 0 && (
        <div className="task-card__history">
          <span className="task-card__history-title">Історія змін за період</span>
          <ul className="task-card__events">
            {task.events.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </ul>
        </div>
      )}

      {task.events.length === 0 && task.assignedAt && (
        <span className="task-card__assigned-at">Закріплено: {task.assignedAt}</span>
      )}

      <div className="task-card__dates">
        <span>Створено: {formatDate(task.createdAt)}</span>
        {task.completedAt && <span>Завершено: {formatDate(task.completedAt)}</span>}
      </div>
    </article>
  )
}

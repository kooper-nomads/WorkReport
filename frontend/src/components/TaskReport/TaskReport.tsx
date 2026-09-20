import { useMemo, useState } from 'react'
import type { Period } from '../PeriodFilter/PeriodFilter'
import { PeriodFilter } from '../PeriodFilter/PeriodFilter'
import { ALL_USERS, UserFilter } from '../UserFilter/UserFilter'
import { TaskCard } from '../TaskCard/TaskCard'
import { useUsers } from '../../api/useUsers'
import type { Task, TaskUser } from '../../types/task'
import './TaskReport.css'

interface TaskReportProps {
  tasks: Task[]
  defaultPeriod: Period
}

function isEventInPeriod(eventDate: string, period: Period) {
  const day = eventDate.slice(0, 10)
  return day >= period.from && day <= period.to
}

export function TaskReport({ tasks, defaultPeriod }: TaskReportProps) {
  const [period, setPeriod] = useState<Period>(defaultPeriod)
  const [userId, setUserId] = useState<string>(ALL_USERS)

  const { data: users, isLoading: isUsersLoading, isError: isUsersError } = useUsers()
  const sortedUsers = useMemo(
    () =>
      (users ?? [])
        .map((user): TaskUser => ({ id: String(user.id), name: user.name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [users],
  )

  const reportTasks = useMemo(
    () =>
      tasks
        .filter(
          (task) => userId === ALL_USERS || task.author.id === userId || task.assignee.id === userId,
        )
        .map((task) => ({
          ...task,
          events: task.events.filter((event) => isEventInPeriod(event.date, period)),
        }))
        .filter((task) => task.events.length > 0),
    [tasks, period, userId],
  )

  return (
    <div className="task-report">
      <header className="task-report__header">
        <h1 className="task-report__title">Звіт по задачах за період</h1>
        <div className="task-report__filters">
          <PeriodFilter value={period} onChange={setPeriod} />
          <UserFilter
            users={sortedUsers}
            value={userId}
            onChange={setUserId}
            disabled={isUsersLoading}
          />
        </div>
      </header>

      {isUsersError && (
        <p className="task-report__error">Не вдалося завантажити список користувачів</p>
      )}

      <p className="task-report__summary">
        Задач зі змінами за період: {reportTasks.length}
      </p>

      <div className="task-report__list">
        {reportTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}

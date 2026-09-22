import { useMemo, useState } from 'react'
import type { Period } from '../PeriodFilter/PeriodFilter'
import { PeriodFilter } from '../PeriodFilter/PeriodFilter'
import { ALL_USERS, UserFilter } from '../UserFilter/UserFilter'
import { TaskColumn } from '../TaskColumn/TaskColumn'
import { useUsers } from '../../api/useUsers'
import { useTasksByStatus } from '../../api/useTasks'
import { daysAgo, daysBetween, today } from '../../utils/date'
import type { Task, TaskUser } from '../../types/task'
import type { ApiAssignedTask } from '../../api/types'
import './TaskReport.css'

const MAX_PERIOD_DAYS = 30

function toRangeTimestamps(period: Period): { from: number; to: number } {
  return {
    from: new Date(`${period.from}T00:00:00`).getTime(),
    to: new Date(`${period.to}T23:59:59.999`).getTime(),
  }
}

function toTask(task: ApiAssignedTask): Task {
  return {
    id: task.id,
    name: task.name,
    status: task.status,
    statusTag: task.statusTag,
    author: task.author,
    assignee: task.assignee,
    tags: task.tags,
    events: [],
    project: task.project,
  }
}

export function TaskReport() {
  const [period, setPeriod] = useState<Period>({ from: daysAgo(7), to: today() })
  const [userEmail, setUserEmail] = useState<string>(ALL_USERS)

  const { data: users, isLoading: isUsersLoading, isError: isUsersError } = useUsers()
  const sortedUsers = useMemo(
    () =>
      (users ?? [])
        .map((user): TaskUser => ({ id: user.email, name: user.name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [users],
  )

  const daysFromToday = daysBetween(period.from, today())
  const isRangeTooLong = daysFromToday > MAX_PERIOD_DAYS
  const isUserSelected = userEmail !== ALL_USERS
  const { from, to } = toRangeTimestamps(period)

  const {
    data: groupedTasksData,
    refetch: refetchTasks,
    isFetching: isTasksLoading,
    isError: isTasksError,
    error: tasksError,
    isSuccess: isTasksLoaded,
  } = useTasksByStatus(userEmail, from, to)

  const todoTasks = useMemo(() => (groupedTasksData?.todo ?? []).map(toTask), [groupedTasksData])
  const inProgressTasks = useMemo(() => (groupedTasksData?.in_progress ?? []).map(toTask), [groupedTasksData])
  const doneTasks = useMemo(() => (groupedTasksData?.done ?? []).map(toTask), [groupedTasksData])

  const handleGenerate = () => {
    void refetchTasks()
  }

  const canGenerate = isUserSelected && !isRangeTooLong && !isTasksLoading

  return (
    <div className="task-report">
      <header className="task-report__header">
        <h1 className="task-report__title">Звіт по задачах за період</h1>
        <div className="task-report__filters">
          <PeriodFilter
            value={period}
            onChange={setPeriod}
            minFrom={daysAgo(MAX_PERIOD_DAYS - 1)}
            maxTo={today()}
          />
          <UserFilter users={sortedUsers} value={userEmail} onChange={setUserEmail} disabled={isUsersLoading} />
          <button type="button" className="task-report__generate" onClick={handleGenerate} disabled={!canGenerate}>
            {isTasksLoading ? 'Генеруємо…' : 'Згенерувати звіт'}
          </button>
        </div>
      </header>

      {isUsersError && <p className="task-report__error">Не вдалося завантажити список користувачів</p>}

      {isRangeTooLong && (
        <p className="task-report__error">
          Максимальний період — {MAX_PERIOD_DAYS} днів тому від сьогодні (для колонки «Готово»)
        </p>
      )}

      {!isUserSelected && <p className="task-report__hint">Оберіть користувача, щоб згенерувати звіт</p>}

      {isTasksError && (
        <p className="task-report__error">
          Не вдалося згенерувати звіт{tasksError instanceof Error ? `: ${tasksError.message}` : ''}
        </p>
      )}

      <div className="task-report__columns">
        <TaskColumn title="До виконання" group="todo" tasks={todoTasks} isLoaded={isTasksLoaded} />
        <TaskColumn title="В процесі" group="in_progress" tasks={inProgressTasks} isLoaded={isTasksLoaded} />
        <TaskColumn title="Виконано" group="done" tasks={doneTasks} isLoaded={isTasksLoaded} />
      </div>
    </div>
  )
}

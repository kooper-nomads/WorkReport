import { useMemo, useState } from 'react'
import type { Period } from '../PeriodFilter/PeriodFilter'
import { PeriodFilter } from '../PeriodFilter/PeriodFilter'
import { ALL_USERS, UserFilter } from '../UserFilter/UserFilter'
import { TaskCard } from '../TaskCard/TaskCard'
import { useUsers } from '../../api/useUsers'
import { useReport } from '../../api/useReport'
import { daysAgo, daysBetween, today } from '../../utils/date'
import type { TaskUser } from '../../types/task'
import './TaskReport.css'

const MAX_REPORT_DAYS = 30

function isEventInPeriod(eventDate: string, period: Period) {
  const day = eventDate.slice(0, 10)
  return day >= period.from && day <= period.to
}

export function TaskReport() {
  const [period, setPeriod] = useState<Period>({ from: daysAgo(7), to: today() })
  const [userId, setUserId] = useState<string>(ALL_USERS)

  const { data: users, isLoading: isUsersLoading, isError: isUsersError } = useUsers()
  const sortedUsers = useMemo(
    () =>
      (users ?? [])
        .map((user): TaskUser => ({ id: String(user.id), name: user.name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [users],
  )

  const daysFromToday = daysBetween(period.from, today())
  const isRangeTooLong = daysFromToday > MAX_REPORT_DAYS
  const isUserSelected = userId !== ALL_USERS

  const {
    data: reportData,
    refetch,
    isFetching: isReportLoading,
    isError: isReportError,
    error: reportError,
    isSuccess: isReportLoaded,
  } = useReport(Number(userId), Math.min(Math.max(daysFromToday, 1), MAX_REPORT_DAYS))

  const reportTasks = useMemo(
    () =>
      (reportData ?? [])
        .map((task) => ({
          ...task,
          events: task.events.filter((event) => isEventInPeriod(event.date, period)),
        }))
        .filter((task) => task.events.length > 0),
    [reportData, period],
  )

  const canGenerate = isUserSelected && !isRangeTooLong && !isReportLoading

  return (
    <div className="task-report">
      <header className="task-report__header">
        <h1 className="task-report__title">Звіт по задачах за період</h1>
        <div className="task-report__filters">
          <PeriodFilter
            value={period}
            onChange={setPeriod}
            minFrom={daysAgo(MAX_REPORT_DAYS - 1)}
            maxTo={today()}
          />
          <UserFilter users={sortedUsers} value={userId} onChange={setUserId} disabled={isUsersLoading} />
          <button
            type="button"
            className="task-report__generate"
            onClick={() => void refetch()}
            disabled={!canGenerate}
          >
            {isReportLoading ? 'Генеруємо…' : 'Згенерувати звіт'}
          </button>
        </div>
      </header>

      {isUsersError && <p className="task-report__error">Не вдалося завантажити список користувачів</p>}

      {isRangeTooLong && (
        <p className="task-report__error">
          Максимальний період — {MAX_REPORT_DAYS} днів тому від сьогодні (обмеження Worksection)
        </p>
      )}

      {!isUserSelected && <p className="task-report__hint">Оберіть користувача, щоб згенерувати звіт</p>}

      {isReportError && (
        <p className="task-report__error">
          Не вдалося згенерувати звіт{reportError instanceof Error ? `: ${reportError.message}` : ''}
        </p>
      )}

      {isReportLoaded && <p className="task-report__summary">Задач зі змінами за період: {reportTasks.length}</p>}

      <div className="task-report__list">
        {reportTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}

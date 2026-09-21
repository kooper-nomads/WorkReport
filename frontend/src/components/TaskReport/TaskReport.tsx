import { useMemo, useState } from 'react'
import type { Period } from '../PeriodFilter/PeriodFilter'
import { PeriodFilter } from '../PeriodFilter/PeriodFilter'
import { ALL_USERS, UserFilter } from '../UserFilter/UserFilter'
import { ALL_TAGS, TagFilter } from '../TagFilter/TagFilter'
import { ALL_TAG_GROUPS, TagGroupFilter } from '../TagGroupFilter/TagGroupFilter'
import { TaskCard } from '../TaskCard/TaskCard'
import { useUsers } from '../../api/useUsers'
import { useTags } from '../../api/useTags'
import { useTagGroups } from '../../api/useTagGroups'
import { useAssignedTasks } from '../../api/useAssignedTasks'
import { daysAgo, daysBetween, today } from '../../utils/date'
import type { Task, TaskUser } from '../../types/task'
import './TaskReport.css'

const MAX_PERIOD_DAYS = 30

function toRangeTimestamps(period: Period): { from: number; to: number } {
  return {
    from: new Date(`${period.from}T00:00:00`).getTime(),
    to: new Date(`${period.to}T23:59:59.999`).getTime(),
  }
}

export function TaskReport() {
  const [period, setPeriod] = useState<Period>({ from: daysAgo(7), to: today() })
  const [userId, setUserId] = useState<string>(ALL_USERS)
  const [tagGroupId, setTagGroupId] = useState<string>(ALL_TAG_GROUPS)
  const [tagId, setTagId] = useState<string>(ALL_TAGS)

  const { data: users, isLoading: isUsersLoading, isError: isUsersError } = useUsers()
  const sortedUsers = useMemo(
    () =>
      (users ?? [])
        .map((user): TaskUser => ({ id: String(user.id), name: user.name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [users],
  )

  const { data: tagGroups, isLoading: isTagGroupsLoading, isError: isTagGroupsError } = useTagGroups()
  const sortedTagGroups = useMemo(
    () =>
      (tagGroups ?? [])
        .map((group) => ({ id: String(group.id), title: group.title }))
        .sort((a, b) => a.title.localeCompare(b.title)),
    [tagGroups],
  )

  const { data: tags, isLoading: isTagsLoading, isError: isTagsError } = useTags()
  const sortedTags = useMemo(
    () =>
      (tags ?? [])
        .map((tag) => ({ id: String(tag.id), title: tag.title, groupId: String(tag.group.id) }))
        .sort((a, b) => a.title.localeCompare(b.title)),
    [tags],
  )

  const visibleTags = useMemo(
    () =>
      tagGroupId === ALL_TAG_GROUPS ? sortedTags : sortedTags.filter((tag) => tag.groupId === tagGroupId),
    [sortedTags, tagGroupId],
  )

  const handleTagGroupChange = (nextTagGroupId: string) => {
    setTagGroupId(nextTagGroupId)
    setTagId(ALL_TAGS)
  }

  const daysFromToday = daysBetween(period.from, today())
  const isRangeTooLong = daysFromToday > MAX_PERIOD_DAYS
  const isUserSelected = userId !== ALL_USERS
  const { from, to } = toRangeTimestamps(period)

  const {
    data: assignedTasksData,
    refetch,
    isFetching: isTasksLoading,
    isError: isTasksError,
    error: tasksError,
    isSuccess: isTasksLoaded,
  } = useAssignedTasks(Number(userId), from, to)

  const assignedTasks = useMemo(
    (): Task[] =>
      (assignedTasksData ?? []).map((task) => ({
        id: task.id,
        name: task.name,
        status: task.status,
        assignee: task.assignee,
        tags: task.tags,
        events: [],
        project: task.project,
        assignedAt: task.assignedAt,
      })),
    [assignedTasksData],
  )

  const filteredTasks = useMemo(
    () =>
      tagId === ALL_TAGS ? assignedTasks : assignedTasks.filter((task) => task.tags.some((tag) => tag.id === tagId)),
    [assignedTasks, tagId],
  )

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
          <UserFilter users={sortedUsers} value={userId} onChange={setUserId} disabled={isUsersLoading} />
          <TagGroupFilter
            groups={sortedTagGroups}
            value={tagGroupId}
            onChange={handleTagGroupChange}
            disabled={isTagGroupsLoading}
          />
          <TagFilter tags={visibleTags} value={tagId} onChange={setTagId} disabled={isTagsLoading} />
          <button
            type="button"
            className="task-report__generate"
            onClick={() => void refetch()}
            disabled={!canGenerate}
          >
            {isTasksLoading ? 'Генеруємо…' : 'Згенерувати звіт'}
          </button>
        </div>
      </header>

      {isUsersError && <p className="task-report__error">Не вдалося завантажити список користувачів</p>}

      {isTagGroupsError && <p className="task-report__error">Не вдалося завантажити список груп тегів</p>}

      {isTagsError && <p className="task-report__error">Не вдалося завантажити список тегів</p>}

      {isRangeTooLong && (
        <p className="task-report__error">
          Максимальний період — {MAX_PERIOD_DAYS} днів тому від сьогодні (обмеження Worksection)
        </p>
      )}

      {!isUserSelected && <p className="task-report__hint">Оберіть користувача, щоб згенерувати звіт</p>}

      {isTasksError && (
        <p className="task-report__error">
          Не вдалося згенерувати звіт{tasksError instanceof Error ? `: ${tasksError.message}` : ''}
        </p>
      )}

      {isTasksLoaded && <p className="task-report__summary">Закріплених задач за період: {filteredTasks.length}</p>}

      <div className="task-report__list">
        {filteredTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}

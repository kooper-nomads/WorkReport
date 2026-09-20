import type { TaskUser } from '../../types/task'
import './UserFilter.css'

export const ALL_USERS = 'all'

interface UserFilterProps {
  users: TaskUser[]
  value: string
  onChange: (userId: string) => void
  disabled?: boolean
}

export function UserFilter({ users, value, onChange, disabled }: UserFilterProps) {
  return (
    <label className="user-filter">
      <span className="user-filter__label">Користувач</span>
      <select
        className="user-filter__select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        <option value={ALL_USERS}>Усі користувачі</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </label>
  )
}

import { useEffect, useRef, useState } from 'react'
import type { TaskUser } from '../../types/task'
import './UserFilter.css'

interface UserFilterProps {
  users: TaskUser[]
  value: string[]
  onChange: (userEmails: string[]) => void
}

function summarize(users: TaskUser[], selected: string[]): string {
  if (selected.length === 0) {
    return 'Оберіть користувачів'
  }

  return selected
    .map((id) => users.find((user) => user.id === id)?.name ?? id)
    .join(', ')
}

export function UserFilter({ users, value, onChange }: UserFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const toggleUser = (userId: string) => {
    onChange(value.includes(userId) ? value.filter((id) => id !== userId) : [...value, userId])
  }

  return (
    <div className="user-filter" ref={rootRef}>
      <span className="user-filter__label">Користувачі</span>
      <button
        type="button"
        className="user-filter__trigger"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
      >
        {summarize(users, value)}
      </button>

      {isOpen && (
        <div className="user-filter__dropdown">
          <div className="user-filter__actions">
            <button type="button" onClick={() => onChange(users.map((user) => user.id))}>
              Обрати всіх
            </button>
            <button type="button" onClick={() => onChange([])}>
              Скинути
            </button>
          </div>
          <ul className="user-filter__list">
            {users.map((user) => (
              <li key={user.id} className="user-filter__item">
                <label>
                  <input
                    type="checkbox"
                    checked={value.includes(user.id)}
                    onChange={() => toggleUser(user.id)}
                  />
                  {user.name}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

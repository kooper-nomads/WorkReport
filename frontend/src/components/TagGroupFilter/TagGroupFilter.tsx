import './TagGroupFilter.css'

export const ALL_TAG_GROUPS = 'all'

interface TagGroupFilterOption {
  id: string
  title: string
}

interface TagGroupFilterProps {
  groups: TagGroupFilterOption[]
  value: string
  onChange: (groupId: string) => void
  disabled?: boolean
}

export function TagGroupFilter({ groups, value, onChange, disabled }: TagGroupFilterProps) {
  return (
    <label className="tag-group-filter">
      <span className="tag-group-filter__label">Група тегів</span>
      <select
        className="tag-group-filter__select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        <option value={ALL_TAG_GROUPS}>Усі групи</option>
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.title}
          </option>
        ))}
      </select>
    </label>
  )
}

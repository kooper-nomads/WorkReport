import './TagFilter.css'

export const ALL_TAGS = 'all'

interface TagFilterOption {
  id: string
  title: string
}

interface TagFilterProps {
  tags: TagFilterOption[]
  value: string
  onChange: (tagId: string) => void
  disabled?: boolean
}

export function TagFilter({ tags, value, onChange, disabled }: TagFilterProps) {
  return (
    <label className="tag-filter">
      <span className="tag-filter__label">Тег</span>
      <select
        className="tag-filter__select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        <option value={ALL_TAGS}>Усі теги</option>
        {tags.map((tag) => (
          <option key={tag.id} value={tag.id}>
            {tag.title}
          </option>
        ))}
      </select>
    </label>
  )
}

import './PeriodFilter.css'

export interface Period {
  from: string
  to: string
}

interface PeriodFilterProps {
  value: Period
  onChange: (period: Period) => void
  minFrom?: string
  maxTo?: string
}

export function PeriodFilter({ value, onChange, minFrom, maxTo }: PeriodFilterProps) {
  return (
    <div className="period-filter">
      <label className="period-filter__field">
        <span className="period-filter__label">Період з</span>
        <input
          type="date"
          value={value.from}
          min={minFrom}
          max={value.to}
          onChange={(event) => onChange({ ...value, from: event.target.value })}
        />
      </label>

      <label className="period-filter__field">
        <span className="period-filter__label">по</span>
        <input
          type="date"
          value={value.to}
          min={value.from}
          max={maxTo}
          onChange={(event) => onChange({ ...value, to: event.target.value })}
        />
      </label>
    </div>
  )
}

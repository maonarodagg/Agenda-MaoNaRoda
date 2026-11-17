import { VISIBILITY_LABELS, type Visibility } from '../../domain/events'
import styles from './EventForm.module.css'

const OPTIONS: Visibility[] = ['personal', 'group', 'team']

interface VisibilityFieldProps {
  value: Visibility
  onChange: (value: Visibility) => void
}

// Quem vê o evento (RF-11).
export function VisibilityField({ value, onChange }: VisibilityFieldProps) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.label}>Quem vê</legend>
      {OPTIONS.map((option) => (
        <label key={option} className={styles.check}>
          <input
            type="radio"
            name="visibility"
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
          />
          {VISIBILITY_LABELS[option]}
        </label>
      ))}
    </fieldset>
  )
}

import { useId } from 'react'
import styles from './TextField.module.css'

interface TextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'url' | 'email' | 'password'
  placeholder?: string
  maxLength?: number
  minLength?: number
  required?: boolean
  autoComplete?: string
}

export function TextField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  maxLength,
  minLength,
  required,
  autoComplete,
}: TextFieldProps) {
  const id = useId()
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        className={styles.input}
        type={type}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        minLength={minLength}
        required={required}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

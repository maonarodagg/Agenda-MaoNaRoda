import styles from './Avatar.module.css'

interface AvatarProps {
  name: string
  url: string | null
  size?: number
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase() || '?'
}

export function Avatar({ name, url, size = 36 }: AvatarProps) {
  const dimension = { width: size, height: size }
  if (url) {
    return <img className={styles.avatar} src={url} alt={name} style={dimension} referrerPolicy="no-referrer" />
  }
  return (
    <span className={`${styles.avatar} ${styles.fallback}`} style={dimension} role="img" aria-label={name}>
      {initials(name)}
    </span>
  )
}

import { useAuth } from '../../hooks/useAuth'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import styles from './UserMenu.module.css'

export function UserMenu() {
  const { user, logout } = useAuth()
  if (!user) return null

  return (
    <div className={styles.menu}>
      <Avatar name={user.name} url={user.avatarUrl} />
      <Button variant="ghost" className={styles.logout} onClick={() => void logout()}>
        Sair
      </Button>
    </div>
  )
}

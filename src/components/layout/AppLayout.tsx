import { Outlet } from 'react-router'
import { AppHeader } from './AppHeader'
import { BottomNav } from './BottomNav'
import styles from './AppLayout.module.css'

// Casca das telas logadas: cabeçalho, conteúdo e navegação.
export function AppLayout() {
  return (
    <div className={styles.shell}>
      <AppHeader />
      <main className={styles.main}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

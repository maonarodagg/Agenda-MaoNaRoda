import { NavLink } from 'react-router'
import { NAV_ITEMS } from './navItems'
import styles from './BottomNav.module.css'

// Navegação inferior, só no celular.
export function BottomNav() {
  return (
    <nav className={styles.nav} aria-label="Principal (celular)">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end
          className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
        >
          <span className={styles.icon} aria-hidden="true">
            {item.icon}
          </span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

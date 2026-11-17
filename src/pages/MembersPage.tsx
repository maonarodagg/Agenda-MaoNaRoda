import { InvitesSection } from '../components/members/InvitesSection'
import { MembersSection } from '../components/members/MembersSection'
import styles from './Page.module.css'

export function MembersPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Equipe</h1>
      <MembersSection />
      <InvitesSection />
    </div>
  )
}

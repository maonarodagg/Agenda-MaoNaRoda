import { useInvites } from '../../hooks/useInvites'
import { Button } from '../ui/Button'
import { FormMessage } from '../ui/FormMessage'
import { Section } from '../ui/Section'
import { NewInviteLink } from './NewInviteLink'
import { PendingInviteRow } from './PendingInviteRow'
import styles from './List.module.css'

// Gerar convite e ver/revogar os pendentes (RF-03, RF-06).
export function InvitesSection() {
  const { invites, loading, error, newLink, clearNewLink, generate, generating, revoke, revoking } = useInvites()

  return (
    <Section
      title="Convites pendentes"
      description="Qualquer membro pode gerar um link. Cada link vale 7 dias e para uma pessoa só."
      action={
        <Button onClick={() => void generate()} loading={generating}>
          Gerar convite
        </Button>
      }
    >
      {newLink && <NewInviteLink link={newLink} onClose={clearNewLink} />}
      {error && <FormMessage tone="error">{error}</FormMessage>}
      {loading && invites.length === 0 ? (
        <p className={styles.empty}>Carregando…</p>
      ) : invites.length === 0 ? (
        <p className={styles.empty}>Nenhum convite pendente.</p>
      ) : (
        <ul className={styles.list}>
          {invites.map((inv) => (
            <PendingInviteRow key={inv.id} invite={inv} revoking={revoking} onRevoke={(id) => void revoke(id)} />
          ))}
        </ul>
      )}
    </Section>
  )
}

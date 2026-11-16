import { useAuth } from '../../hooks/useAuth'
import { useMembers } from '../../hooks/useMembers'
import { FormMessage } from '../ui/FormMessage'
import { Section } from '../ui/Section'
import { MemberRow } from './MemberRow'
import styles from './List.module.css'

// Lista de membros (RF-06). Só o dono vê "Remover" nos outros.
export function MembersSection() {
  const { user } = useAuth()
  const { team, members, loading, error, remove, removing, removeError } = useMembers()
  const ownerId = team?.ownerId ?? null
  const iAmOwner = user !== null && user.id === ownerId

  return (
    <Section title="Membros" description={team ? `Equipe ${team.name}` : undefined}>
      {error && <FormMessage tone="error">{error}</FormMessage>}
      {removeError && <FormMessage tone="error">{removeError}</FormMessage>}
      {loading && !team ? (
        <p className={styles.empty}>Carregando…</p>
      ) : (
        <ul className={styles.list}>
          {members.map((m) => (
            <MemberRow
              key={m.userId}
              member={m}
              isOwner={m.userId === ownerId}
              isMe={m.userId === user?.id}
              canRemove={iAmOwner && m.userId !== ownerId}
              removing={removing}
              onRemove={(id) => void remove(id)}
            />
          ))}
        </ul>
      )}
    </Section>
  )
}

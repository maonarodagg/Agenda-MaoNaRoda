import { formatDate } from '../../domain/dates'
import type { Member } from '../../domain/team'
import { Avatar } from '../ui/Avatar'
import { ConfirmButton } from '../ui/ConfirmButton'
import styles from './List.module.css'

interface MemberRowProps {
  member: Member
  isOwner: boolean
  isMe: boolean
  canRemove: boolean
  removing: boolean
  onRemove: (userId: string) => void
}

export function MemberRow({ member, isOwner, isMe, canRemove, removing, onRemove }: MemberRowProps) {
  return (
    <li className={styles.row}>
      <Avatar name={member.name} url={null} size={40} />
      <div className={styles.info}>
        <span className={styles.primary}>
          {member.name}
          {isMe && <span className={styles.muted}> (você)</span>}
          {isOwner && <span className={styles.badge}>Dono</span>}
        </span>
        <span className={styles.secondary}>{member.email}</span>
        <span className={styles.secondary}>Desde {formatDate(member.joinedAt)}</span>
      </div>
      {canRemove && (
        <ConfirmButton
          label="Remover"
          confirmLabel="Confirmar remoção"
          disabled={removing}
          onConfirm={() => onRemove(member.userId)}
        />
      )}
    </li>
  )
}

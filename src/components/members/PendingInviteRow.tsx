import { formatDateTime } from '../../domain/dates'
import type { PendingInvite } from '../../domain/team'
import { ConfirmButton } from '../ui/ConfirmButton'
import styles from './List.module.css'

interface PendingInviteRowProps {
  invite: PendingInvite
  revoking: boolean
  onRevoke: (inviteId: string) => void
}

export function PendingInviteRow({ invite, revoking, onRevoke }: PendingInviteRowProps) {
  return (
    <li className={styles.row}>
      <div className={styles.info}>
        <span className={styles.primary}>Convite de {invite.createdByName ?? 'ex-membro'}</span>
        <span className={styles.secondary}>Gerado em {formatDateTime(invite.createdAt)}</span>
        <span className={styles.secondary}>Expira em {formatDateTime(invite.expiresAt)}</span>
      </div>
      <ConfirmButton
        label="Revogar"
        confirmLabel="Confirmar revogação"
        disabled={revoking}
        onConfirm={() => onRevoke(invite.id)}
      />
    </li>
  )
}

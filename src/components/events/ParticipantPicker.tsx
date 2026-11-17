import type { Member } from '../../domain/team'
import styles from './EventForm.module.css'

interface ParticipantPickerProps {
  members: Member[] // já sem o criador
  selected: string[]
  required: boolean
  onChange: (ids: string[]) => void
}

// Escolha de participantes. Participante entra direto, sem aceitar (decisão fechada).
export function ParticipantPicker({ members, selected, required, onChange }: ParticipantPickerProps) {
  const toggle = (id: string, checked: boolean) =>
    onChange(checked ? [...selected, id] : selected.filter((s) => s !== id))

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.label}>Participantes{required ? ' (pelo menos 1)' : ' (opcional)'}</legend>
      {members.length === 0 ? (
        <p className={styles.hint}>Ainda não há outros membros. Convide pela tela Equipe.</p>
      ) : (
        members.map((m) => (
          <label key={m.userId} className={styles.check}>
            <input
              type="checkbox"
              checked={selected.includes(m.userId)}
              onChange={(e) => toggle(m.userId, e.target.checked)}
            />
            {m.name}
          </label>
        ))
      )}
      <p className={styles.hint}>Quem você marcar vê o evento e também pode editar e excluir.</p>
    </fieldset>
  )
}

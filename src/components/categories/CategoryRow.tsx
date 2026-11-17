import { useState } from 'react'
import type { Category } from '../../domain/events'
import { Button } from '../ui/Button'
import { ConfirmButton } from '../ui/ConfirmButton'
import { CategoryForm } from './CategoryForm'
import styles from './Categories.module.css'

interface CategoryRowProps {
  category: Category
  saving: boolean
  deleting: boolean
  onUpdate: (id: string, name: string, color: string) => Promise<boolean>
  onDelete: (id: string) => void
}

export function CategoryRow({ category, saving, deleting, onUpdate, onDelete }: CategoryRowProps) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <li className={styles.row}>
        <CategoryForm
          initialName={category.name}
          initialColor={category.color}
          submitLabel="Salvar"
          saving={saving}
          onSubmit={async (name, color) => {
            const ok = await onUpdate(category.id, name, color)
            if (ok) setEditing(false)
            return ok
          }}
          onCancel={() => setEditing(false)}
        />
      </li>
    )
  }

  return (
    <li className={styles.row}>
      <span className={styles.swatch} style={{ background: category.color }} aria-hidden="true" />
      <span className={styles.label}>{category.name}</span>
      <div className={styles.rowActions}>
        <Button variant="ghost" className={styles.small} onClick={() => setEditing(true)}>
          Editar
        </Button>
        <ConfirmButton
          label="Excluir"
          confirmLabel="Confirmar exclusão"
          disabled={deleting}
          onConfirm={() => onDelete(category.id)}
        />
      </div>
    </li>
  )
}

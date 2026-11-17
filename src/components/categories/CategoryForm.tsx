import { useState, type FormEvent } from 'react'
import { Button } from '../ui/Button'
import styles from './Categories.module.css'

interface CategoryFormProps {
  initialName?: string
  initialColor?: string
  submitLabel: string
  saving: boolean
  onSubmit: (name: string, color: string) => Promise<boolean>
  onCancel?: () => void
}

// Nome + cor. Usado pra criar e pra editar.
export function CategoryForm({
  initialName = '',
  initialColor = '#0A66E0',
  submitLabel,
  saving,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const [name, setName] = useState(initialName)
  const [color, setColor] = useState(initialColor)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const ok = await onSubmit(name, color.toUpperCase())
    // Ao criar, limpa o campo pra próxima.
    if (ok && !onCancel) setName('')
  }

  return (
    <form className={styles.form} onSubmit={(e) => void submit(e)}>
      <input
        className={styles.color}
        type="color"
        value={color}
        aria-label="Cor da categoria"
        onChange={(e) => setColor(e.target.value)}
      />
      <input
        className={styles.name}
        value={name}
        maxLength={40}
        required
        placeholder="Nome da categoria"
        aria-label="Nome da categoria"
        onChange={(e) => setName(e.target.value)}
      />
      <div className={styles.formActions}>
        {onCancel && (
          <Button variant="ghost" className={styles.small} onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" className={styles.small} loading={saving} disabled={!name.trim()}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

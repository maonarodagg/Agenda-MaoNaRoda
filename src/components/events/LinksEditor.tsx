import type { LinkDraft } from '../../domain/eventDraft'
import { Button } from '../ui/Button'
import styles from './EventForm.module.css'

interface LinksEditorProps {
  links: LinkDraft[]
  onChange: (links: LinkDraft[]) => void
}

// Links do evento (Meet, Drive...), com título opcional. Sem upload (RF-14).
export function LinksEditor({ links, onChange }: LinksEditorProps) {
  const update = (index: number, patch: Partial<LinkDraft>) =>
    onChange(links.map((l, i) => (i === index ? { ...l, ...patch } : l)))

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.label}>Links</legend>
      {links.map((link, index) => (
        <div key={index} className={styles.linkRow}>
          <div className={styles.linkInputs}>
            <input
              className={styles.input}
              type="url"
              inputMode="url"
              placeholder="https://..."
              aria-label={`Endereço do link ${index + 1}`}
              value={link.url}
              onChange={(e) => update(index, { url: e.target.value })}
            />
            <input
              className={styles.input}
              type="text"
              placeholder="Título (opcional), ex.: Meet"
              aria-label={`Título do link ${index + 1}`}
              maxLength={120}
              value={link.title}
              onChange={(e) => update(index, { title: e.target.value })}
            />
          </div>
          <Button
            variant="ghost"
            className={styles.smallButton}
            aria-label={`Remover link ${index + 1}`}
            onClick={() => onChange(links.filter((_, i) => i !== index))}
          >
            Remover
          </Button>
        </div>
      ))}
      <div>
        <Button variant="soft" className={styles.smallButton} onClick={() => onChange([...links, { url: '', title: '' }])}>
          + Adicionar link
        </Button>
      </div>
    </fieldset>
  )
}

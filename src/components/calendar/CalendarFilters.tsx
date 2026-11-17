import type { Category } from '../../domain/events'
import { DEFAULT_FILTER, isFilterActive, NO_CATEGORY, type CalendarFilter, type FilterScope } from '../../domain/filters'
import type { Member } from '../../domain/team'
import styles from './CalendarFilters.module.css'

interface CalendarFiltersProps {
  filter: CalendarFilter
  members: Member[]
  categories: Category[]
  currentUserId: string
  onChange: (filter: CalendarFilter) => void
}

// Filtros: equipe toda / meus / por pessoa, e por categoria (RF-08).
export function CalendarFilters({ filter, members, categories, currentUserId, onChange }: CalendarFiltersProps) {
  const others = members.filter((m) => m.userId !== currentUserId)

  const setScope = (scope: FilterScope) =>
    onChange({ ...filter, scope, personId: scope === 'person' ? (filter.personId ?? others[0]?.userId ?? null) : null })

  const toggleCategory = (id: string) =>
    onChange({
      ...filter,
      categoryIds: filter.categoryIds.includes(id)
        ? filter.categoryIds.filter((c) => c !== id)
        : [...filter.categoryIds, id],
    })

  const chips = [
    ...categories.map((c) => ({ id: c.id, name: c.name, color: c.color })),
    { id: NO_CATEGORY, name: 'Sem categoria', color: 'var(--color-brand)' },
  ]

  return (
    <div className={styles.filters} role="group" aria-label="Filtros do calendário">
      <div className={styles.selects}>
        <label className={styles.field}>
          <span className={styles.label}>Mostrar</span>
          <select
            className={styles.select}
            value={filter.scope}
            onChange={(e) => setScope(e.target.value as FilterScope)}
          >
            <option value="all">Equipe toda</option>
            <option value="mine">Meus eventos</option>
            <option value="person" disabled={others.length === 0}>
              De uma pessoa
            </option>
          </select>
        </label>
        {filter.scope === 'person' && (
          <label className={styles.field}>
            <span className={styles.label}>Pessoa</span>
            <select
              className={styles.select}
              value={filter.personId ?? ''}
              onChange={(e) => onChange({ ...filter, personId: e.target.value })}
            >
              {others.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className={styles.chips}>
        {chips.map((chip) => {
          const active = filter.categoryIds.includes(chip.id)
          return (
            <button
              key={chip.id}
              type="button"
              className={active ? `${styles.chip} ${styles.chipActive}` : styles.chip}
              aria-pressed={active}
              onClick={() => toggleCategory(chip.id)}
            >
              <span className={styles.dot} style={{ background: chip.color }} aria-hidden="true" />
              {chip.name}
            </button>
          )
        })}
        {isFilterActive(filter) && (
          <button type="button" className={styles.clear} onClick={() => onChange(DEFAULT_FILTER)}>
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  )
}

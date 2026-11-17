import { CategoryForm } from '../components/categories/CategoryForm'
import { CategoryRow } from '../components/categories/CategoryRow'
import { FormMessage } from '../components/ui/FormMessage'
import { Section } from '../components/ui/Section'
import { useCategories } from '../hooks/useCategories'
import { useCategoryActions } from '../hooks/useCategoryActions'
import listStyles from '../components/categories/Categories.module.css'
import styles from './Page.module.css'

// Categorias com cor, editáveis por qualquer membro (RF-13).
export function CategoriesPage() {
  const { categories, loading, error, reload } = useCategories()
  const { create, update, remove } = useCategoryActions(reload)
  const actionError = create.error ?? update.error ?? remove.error

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Categorias</h1>
      <Section
        title="Nova categoria"
        description="Qualquer membro pode criar, editar e excluir. A cor aparece nos eventos do calendário."
      >
        <CategoryForm submitLabel="Criar" saving={create.loading} onSubmit={create.run} />
      </Section>
      <Section title="Todas as categorias">
        {(error ?? actionError) && <FormMessage tone="error">{error ?? actionError}</FormMessage>}
        {loading && categories.length === 0 ? (
          <p>Carregando…</p>
        ) : (
          <ul className={listStyles.list}>
            {categories.map((c) => (
              <CategoryRow
                key={c.id}
                category={c}
                saving={update.loading}
                deleting={remove.loading}
                onUpdate={update.run}
                onDelete={(id) => void remove.run(id)}
              />
            ))}
          </ul>
        )}
        <p className={listStyles.hint}>Ao excluir uma categoria, os eventos dela ficam sem categoria.</p>
      </Section>
    </div>
  )
}

import { listCategories } from '../services/categories'
import { useAsyncData } from './useAsyncData'

export function useCategories() {
  const { data, error, loading, reload } = useAsyncData(listCategories, 'Não foi possível carregar as categorias.')
  return { categories: data ?? [], error, loading, reload }
}

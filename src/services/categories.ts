import type { Category } from '../domain/events'
import { supabase } from '../lib/supabase'

export class CategoryError extends Error {}

// Converte erros do banco em mensagens claras.
function fail(error: { code?: string }): never {
  if (error.code === '23505') throw new CategoryError('Já existe uma categoria com esse nome.')
  if (error.code === '23514') throw new CategoryError('Confira o nome (1 a 40 letras) e a cor.')
  throw new CategoryError('Não foi possível salvar a categoria. Tente de novo.')
}

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('id, name, color').order('name')
  if (error) throw error
  return data
}

export async function createCategory(name: string, color: string): Promise<void> {
  const { error } = await supabase.from('categories').insert({ name: name.trim(), color })
  if (error) fail(error)
}

export async function updateCategory(id: string, name: string, color: string): Promise<void> {
  const { error } = await supabase.from('categories').update({ name: name.trim(), color }).eq('id', id)
  if (error) fail(error)
}

// Os eventos da categoria ficam sem categoria (on delete set null).
export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw new CategoryError('Não foi possível excluir a categoria.')
}

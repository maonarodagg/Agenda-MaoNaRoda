import type { Category } from '../domain/events'
import { supabase } from '../lib/supabase'

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('id, name, color').order('name')
  if (error) throw error
  return data
}

import { supabase } from '@/lib/supabase'

export const categoryService = {
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, description, image_url, parent_id, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    if (error) throw error
    return data || []
  },

  async getBySlug(slug) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
    if (error) throw error
    return data
  },

  async getTree() {
    const all = await categoryService.getAll()
    const roots = all.filter(c => !c.parent_id)
    return roots.map(root => ({
      ...root,
      children: all.filter(c => c.parent_id === root.id),
    }))
  },
}

export default categoryService

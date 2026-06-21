import { supabase } from '@/lib/supabase'

export const brandService = {
  async getAll() {
    const { data, error } = await supabase
      .from('brands')
      .select('id, name, slug, description, logo_url, website_url')
      .eq('is_active', true)
      .order('name', { ascending: true })
    if (error) throw error
    return data || []
  },

  async getBySlug(slug) {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
    if (error) throw error
    return data
  },
}

export default brandService

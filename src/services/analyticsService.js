import { supabase } from '@/lib/supabase'

export const analyticsService = {
  /**
   * Revenue over time (grouped by day)
   */
  async getRevenue(days = 30) {
    const since = new Date(Date.now() - days * 86400000).toISOString()
    const { data } = await supabase
      .from('orders')
      .select('total, created_at')
      .eq('payment_status', 'paid')
      .gte('created_at', since)
      .order('created_at', { ascending: true })

    const map = {}
    ;(data || []).forEach(o => {
      const day = o.created_at.slice(0, 10)
      map[day] = (map[day] || 0) + Number(o.total)
    })
    return Object.entries(map).map(([date, revenue]) => ({ date, revenue }))
  },

  /**
   * Top selling products by quantity
   */
  async getTopProducts(limit = 10) {
    const { data } = await supabase
      .from('order_items')
      .select('product_name, product_id, quantity, total_price')
      .order('quantity', { ascending: false })

    // Aggregate by product
    const map = {}
    ;(data || []).forEach(item => {
      const key = item.product_id || item.product_name
      if (!map[key]) map[key] = { name: item.product_name, quantity: 0, revenue: 0 }
      map[key].quantity += item.quantity
      map[key].revenue += Number(item.total_price)
    })

    return Object.values(map)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit)
  },

  /**
   * Order counts by status
   */
  async getOrdersByStatus() {
    const { data } = await supabase.from('orders').select('status')
    const counts = {}
    ;(data || []).forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1 })
    return counts
  },

  /**
   * New customers over time
   */
  async getNewCustomers(days = 30) {
    const since = new Date(Date.now() - days * 86400000).toISOString()
    const { data } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('role', 'customer')
      .gte('created_at', since)
      .order('created_at', { ascending: true })

    const map = {}
    ;(data || []).forEach(p => {
      const day = p.created_at.slice(0, 10)
      map[day] = (map[day] || 0) + 1
    })
    return Object.entries(map).map(([date, count]) => ({ date, count }))
  },
}

export default analyticsService

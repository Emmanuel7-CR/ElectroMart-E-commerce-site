import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [], // [{ product_id, name, slug, price, image_url }]

      addItem: (product) => {
        const { items } = get()
        if (items.some(i => i.product_id === product.id)) return
        set({
          items: [
            ...items,
            {
              product_id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              image_url: product.product_images?.[0]?.url ?? null,
            },
          ],
        })
      },

      removeItem: (productId) => {
        set({ items: get().items.filter(i => i.product_id !== productId) })
      },

      toggle: (product) => {
        const { hasItem, addItem, removeItem } = get()
        if (hasItem(product.id)) {
          removeItem(product.id)
        } else {
          addItem(product)
        }
      },

      hasItem: (productId) => get().items.some(i => i.product_id === productId),

      count: () => get().items.length,

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'wishlist-storage',
    }
  )
)

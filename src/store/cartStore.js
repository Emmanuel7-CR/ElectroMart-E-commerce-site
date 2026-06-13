import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set(s => ({ isOpen: !s.isOpen })),

      addItem: (product, variant = null, quantity = 1) => {
        const { items } = get()
        const key = `${product.id}-${variant?.id ?? 'default'}`
        const existing = items.find(i => i.key === key)

        if (existing) {
          set({
            items: items.map(i =>
              i.key === key
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          })
        } else {
          const price = variant?.price ?? product.price
          set({
            items: [
              ...items,
              {
                key,
                product_id: product.id,
                variant_id: variant?.id ?? null,
                name: product.name,
                variant_name: variant?.name ?? null,
                slug: product.slug,
                image_url: product.product_images?.[0]?.url ?? null,
                unit_price: price,
                quantity,
                sku: variant?.sku ?? product.sku,
                stock_qty: variant?.stock_qty ?? 999,
              },
            ],
          })
        }
      },

      removeItem: (key) => {
        set({ items: get().items.filter(i => i.key !== key) })
      },

      updateQuantity: (key, quantity) => {
        if (quantity < 1) {
          get().removeItem(key)
          return
        }
        set({
          items: get().items.map(i =>
            i.key === key ? { ...i, quantity } : i
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      // Computed
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0),

      hasItem: (productId, variantId = null) => {
        const key = `${productId}-${variantId ?? 'default'}`
        return get().items.some(i => i.key === key)
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
)

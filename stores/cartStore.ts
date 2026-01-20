import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Product } from '@/types'

export interface CartItem {
  id: string
  product: Product
  quantity: number
}

interface CartState {
  items: CartItem[]
  itemCount: number
  total: number

  // Actions
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void

  // Computed
  getItemQuantity: (productId: string) => number
  isInCart: (productId: string) => boolean
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      total: 0,

      addItem: (product: Product, quantity: number = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          )

          let newItems: CartItem[]

          if (existingItem) {
            // Update quantity if item exists
            newItems = state.items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          } else {
            // Add new item
            newItems = [
              ...state.items,
              {
                id: `${product.id}-${Date.now()}`,
                product,
                quantity,
              },
            ]
          }

          return {
            items: newItems,
            itemCount: calculateItemCount(newItems),
            total: calculateTotal(newItems),
          }
        })
      },

      removeItem: (productId: string) => {
        set((state) => {
          const newItems = state.items.filter(
            (item) => item.product.id !== productId
          )
          return {
            items: newItems,
            itemCount: calculateItemCount(newItems),
            total: calculateTotal(newItems),
          }
        })
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        set((state) => {
          const newItems = state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          )
          return {
            items: newItems,
            itemCount: calculateItemCount(newItems),
            total: calculateTotal(newItems),
          }
        })
      },

      clearCart: () => {
        set({
          items: [],
          itemCount: 0,
          total: 0,
        })
      },

      getItemQuantity: (productId: string) => {
        const item = get().items.find((item) => item.product.id === productId)
        return item?.quantity || 0
      },

      isInCart: (productId: string) => {
        return get().items.some((item) => item.product.id === productId)
      },
    }),
    {
      name: 'vivr-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        itemCount: state.itemCount,
        total: state.total,
      }),
    }
  )
)

// Helper functions
function calculateItemCount(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + item.quantity, 0)
}

function calculateTotal(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
}

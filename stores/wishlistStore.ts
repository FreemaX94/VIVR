import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Product } from '@/types'

export interface WishlistItem {
  id: string
  product: Product
  addedAt: Date
}

interface WishlistState {
  items: WishlistItem[]

  // Actions
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  toggleItem: (product: Product) => void
  clearWishlist: () => void

  // Computed
  isInWishlist: (productId: string) => boolean
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product) => {
        set((state) => {
          // Check if already in wishlist
          if (state.items.some((item) => item.product.id === product.id)) {
            return state
          }

          return {
            items: [
              ...state.items,
              {
                id: `${product.id}-${Date.now()}`,
                product,
                addedAt: new Date(),
              },
            ],
          }
        })
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }))
      },

      toggleItem: (product: Product) => {
        const isInWishlist = get().isInWishlist(product.id)
        if (isInWishlist) {
          get().removeItem(product.id)
        } else {
          get().addItem(product)
        }
      },

      clearWishlist: () => {
        set({ items: [] })
      },

      isInWishlist: (productId: string) => {
        return get().items.some((item) => item.product.id === productId)
      },
    }),
    {
      name: 'vivr-wishlist',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
)

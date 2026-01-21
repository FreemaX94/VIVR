import { act } from '@testing-library/react'
import { useWishlistStore } from '@/stores/wishlistStore'
import { Product, Category } from '@/types'

const mockCategory: Category = {
  id: 'cat-1',
  name: 'Salon',
  slug: 'salon',
}

const mockProduct: Product = {
  id: 'prod-1',
  name: 'Lampe de table',
  slug: 'lampe-de-table',
  description: 'Une belle lampe',
  price: 89.99,
  images: ['image1.jpg'],
  category: mockCategory,
  categoryId: 'cat-1',
  stock: 10,
  featured: false,
  reviews: [],
  createdAt: new Date(),
}

const mockProduct2: Product = {
  id: 'prod-2',
  name: 'Vase céramique',
  slug: 'vase-ceramique',
  description: 'Un beau vase',
  price: 45.00,
  images: ['image2.jpg'],
  category: mockCategory,
  categoryId: 'cat-1',
  stock: 5,
  featured: true,
  reviews: [],
  createdAt: new Date(),
}

describe('wishlistStore', () => {
  beforeEach(() => {
    act(() => {
      useWishlistStore.getState().clearWishlist()
    })
  })

  describe('initial state', () => {
    it('should have empty wishlist initially', () => {
      const state = useWishlistStore.getState()
      expect(state.items).toEqual([])
    })
  })

  describe('addItem', () => {
    it('should add item to wishlist', () => {
      act(() => {
        useWishlistStore.getState().addItem(mockProduct)
      })

      const state = useWishlistStore.getState()
      expect(state.items).toHaveLength(1)
      expect(state.items[0].product.id).toBe('prod-1')
    })

    it('should not add duplicate item', () => {
      act(() => {
        useWishlistStore.getState().addItem(mockProduct)
        useWishlistStore.getState().addItem(mockProduct)
      })

      expect(useWishlistStore.getState().items).toHaveLength(1)
    })

    it('should add multiple different items', () => {
      act(() => {
        useWishlistStore.getState().addItem(mockProduct)
        useWishlistStore.getState().addItem(mockProduct2)
      })

      expect(useWishlistStore.getState().items).toHaveLength(2)
    })

    it('should set addedAt date', () => {
      const beforeAdd = new Date()

      act(() => {
        useWishlistStore.getState().addItem(mockProduct)
      })

      const afterAdd = new Date()
      const addedAt = new Date(useWishlistStore.getState().items[0].addedAt)

      expect(addedAt.getTime()).toBeGreaterThanOrEqual(beforeAdd.getTime())
      expect(addedAt.getTime()).toBeLessThanOrEqual(afterAdd.getTime())
    })

    it('should create unique wishlist item IDs', () => {
      act(() => {
        useWishlistStore.getState().addItem(mockProduct)
        useWishlistStore.getState().addItem(mockProduct2)
      })

      const state = useWishlistStore.getState()
      expect(state.items[0].id).not.toBe(state.items[1].id)
    })
  })

  describe('removeItem', () => {
    it('should remove item from wishlist', () => {
      act(() => {
        useWishlistStore.getState().addItem(mockProduct)
        useWishlistStore.getState().addItem(mockProduct2)
        useWishlistStore.getState().removeItem('prod-1')
      })

      const state = useWishlistStore.getState()
      expect(state.items).toHaveLength(1)
      expect(state.items[0].product.id).toBe('prod-2')
    })

    it('should do nothing if item does not exist', () => {
      act(() => {
        useWishlistStore.getState().addItem(mockProduct)
        useWishlistStore.getState().removeItem('non-existent')
      })

      expect(useWishlistStore.getState().items).toHaveLength(1)
    })

    it('should handle removing from empty wishlist', () => {
      act(() => {
        useWishlistStore.getState().removeItem('prod-1')
      })

      expect(useWishlistStore.getState().items).toEqual([])
    })
  })

  describe('toggleItem', () => {
    it('should add item if not in wishlist', () => {
      act(() => {
        useWishlistStore.getState().toggleItem(mockProduct)
      })

      expect(useWishlistStore.getState().items).toHaveLength(1)
      expect(useWishlistStore.getState().isInWishlist('prod-1')).toBe(true)
    })

    it('should remove item if already in wishlist', () => {
      act(() => {
        useWishlistStore.getState().addItem(mockProduct)
        useWishlistStore.getState().toggleItem(mockProduct)
      })

      expect(useWishlistStore.getState().items).toHaveLength(0)
      expect(useWishlistStore.getState().isInWishlist('prod-1')).toBe(false)
    })

    it('should toggle multiple times correctly', () => {
      act(() => {
        useWishlistStore.getState().toggleItem(mockProduct) // Add
        useWishlistStore.getState().toggleItem(mockProduct) // Remove
        useWishlistStore.getState().toggleItem(mockProduct) // Add again
      })

      expect(useWishlistStore.getState().isInWishlist('prod-1')).toBe(true)
    })
  })

  describe('clearWishlist', () => {
    it('should remove all items from wishlist', () => {
      act(() => {
        useWishlistStore.getState().addItem(mockProduct)
        useWishlistStore.getState().addItem(mockProduct2)
        useWishlistStore.getState().clearWishlist()
      })

      expect(useWishlistStore.getState().items).toEqual([])
    })

    it('should work on empty wishlist', () => {
      act(() => {
        useWishlistStore.getState().clearWishlist()
      })

      expect(useWishlistStore.getState().items).toEqual([])
    })
  })

  describe('isInWishlist', () => {
    it('should return true for item in wishlist', () => {
      act(() => {
        useWishlistStore.getState().addItem(mockProduct)
      })

      expect(useWishlistStore.getState().isInWishlist('prod-1')).toBe(true)
    })

    it('should return false for item not in wishlist', () => {
      expect(useWishlistStore.getState().isInWishlist('prod-1')).toBe(false)
    })

    it('should return false after item is removed', () => {
      act(() => {
        useWishlistStore.getState().addItem(mockProduct)
        useWishlistStore.getState().removeItem('prod-1')
      })

      expect(useWishlistStore.getState().isInWishlist('prod-1')).toBe(false)
    })

    it('should return false after wishlist is cleared', () => {
      act(() => {
        useWishlistStore.getState().addItem(mockProduct)
        useWishlistStore.getState().clearWishlist()
      })

      expect(useWishlistStore.getState().isInWishlist('prod-1')).toBe(false)
    })
  })
})

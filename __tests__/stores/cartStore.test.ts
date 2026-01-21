import { act } from '@testing-library/react'
import { useCartStore } from '@/stores/cartStore'
import { Product, Category } from '@/types'

// Mock product data
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

describe('cartStore', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useCartStore.getState().clearCart()
    })
  })

  describe('initial state', () => {
    it('should have empty cart initially', () => {
      const state = useCartStore.getState()
      expect(state.items).toEqual([])
      expect(state.itemCount).toBe(0)
      expect(state.total).toBe(0)
    })
  })

  describe('addItem', () => {
    it('should add a new item to cart', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct)
      })

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(1)
      expect(state.items[0].product.id).toBe('prod-1')
      expect(state.items[0].quantity).toBe(1)
    })

    it('should add item with specified quantity', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, 3)
      })

      const state = useCartStore.getState()
      expect(state.items[0].quantity).toBe(3)
    })

    it('should update quantity if item already exists', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, 2)
        useCartStore.getState().addItem(mockProduct, 3)
      })

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(1)
      expect(state.items[0].quantity).toBe(5)
    })

    it('should update itemCount correctly', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, 2)
        useCartStore.getState().addItem(mockProduct2, 3)
      })

      expect(useCartStore.getState().itemCount).toBe(5)
    })

    it('should calculate total correctly', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, 2) // 89.99 * 2 = 179.98
        useCartStore.getState().addItem(mockProduct2, 1) // 45.00 * 1 = 45.00
      })

      // Total should be 224.98
      expect(useCartStore.getState().total).toBeCloseTo(224.98, 2)
    })

    it('should create unique cart item IDs', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct)
        useCartStore.getState().addItem(mockProduct2)
      })

      const state = useCartStore.getState()
      expect(state.items[0].id).not.toBe(state.items[1].id)
    })
  })

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct)
        useCartStore.getState().addItem(mockProduct2)
        useCartStore.getState().removeItem('prod-1')
      })

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(1)
      expect(state.items[0].product.id).toBe('prod-2')
    })

    it('should update itemCount after removal', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, 5)
        useCartStore.getState().removeItem('prod-1')
      })

      expect(useCartStore.getState().itemCount).toBe(0)
    })

    it('should update total after removal', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, 2)
        useCartStore.getState().addItem(mockProduct2, 1)
        useCartStore.getState().removeItem('prod-1')
      })

      expect(useCartStore.getState().total).toBeCloseTo(45.00, 2)
    })

    it('should do nothing if item does not exist', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct)
        useCartStore.getState().removeItem('non-existent')
      })

      expect(useCartStore.getState().items).toHaveLength(1)
    })
  })

  describe('updateQuantity', () => {
    it('should update quantity of existing item', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, 2)
        useCartStore.getState().updateQuantity('prod-1', 5)
      })

      expect(useCartStore.getState().items[0].quantity).toBe(5)
    })

    it('should remove item if quantity is 0 or less', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, 2)
        useCartStore.getState().updateQuantity('prod-1', 0)
      })

      expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('should remove item if quantity is negative', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, 2)
        useCartStore.getState().updateQuantity('prod-1', -1)
      })

      expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('should update itemCount after quantity change', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, 2)
        useCartStore.getState().addItem(mockProduct2, 1)
        useCartStore.getState().updateQuantity('prod-1', 5)
      })

      expect(useCartStore.getState().itemCount).toBe(6)
    })

    it('should update total after quantity change', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, 1)
        useCartStore.getState().updateQuantity('prod-1', 3)
      })

      expect(useCartStore.getState().total).toBeCloseTo(269.97, 2)
    })
  })

  describe('clearCart', () => {
    it('should remove all items from cart', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, 2)
        useCartStore.getState().addItem(mockProduct2, 3)
        useCartStore.getState().clearCart()
      })

      const state = useCartStore.getState()
      expect(state.items).toEqual([])
      expect(state.itemCount).toBe(0)
      expect(state.total).toBe(0)
    })

    it('should work on empty cart', () => {
      act(() => {
        useCartStore.getState().clearCart()
      })

      expect(useCartStore.getState().items).toEqual([])
    })
  })

  describe('getItemQuantity', () => {
    it('should return quantity of existing item', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, 3)
      })

      expect(useCartStore.getState().getItemQuantity('prod-1')).toBe(3)
    })

    it('should return 0 for non-existing item', () => {
      expect(useCartStore.getState().getItemQuantity('non-existent')).toBe(0)
    })

    it('should return updated quantity after change', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, 2)
        useCartStore.getState().updateQuantity('prod-1', 7)
      })

      expect(useCartStore.getState().getItemQuantity('prod-1')).toBe(7)
    })
  })

  describe('isInCart', () => {
    it('should return true for item in cart', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct)
      })

      expect(useCartStore.getState().isInCart('prod-1')).toBe(true)
    })

    it('should return false for item not in cart', () => {
      expect(useCartStore.getState().isInCart('prod-1')).toBe(false)
    })

    it('should return false after item is removed', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct)
        useCartStore.getState().removeItem('prod-1')
      })

      expect(useCartStore.getState().isInCart('prod-1')).toBe(false)
    })
  })

  describe('calculations', () => {
    it('should handle decimal prices correctly', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, 3) // 89.99 * 3 = 269.97
      })

      expect(useCartStore.getState().total).toBeCloseTo(269.97, 2)
    })

    it('should handle multiple items with different quantities', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, 2)
        useCartStore.getState().addItem(mockProduct2, 4)
      })

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(2)
      expect(state.itemCount).toBe(6)
      // (89.99 * 2) + (45.00 * 4) = 179.98 + 180.00 = 359.98
      expect(state.total).toBeCloseTo(359.98, 2)
    })
  })
})

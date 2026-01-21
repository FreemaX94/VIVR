import { render, screen, fireEvent } from '@testing-library/react'
import { CartItem } from '@/components/cart/CartItem'
import { useCartStore, CartItem as CartItemType } from '@/stores/cartStore'
import { act } from '@testing-library/react'
import { Product, Category } from '@/types'

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}))

const mockCategory: Category = {
  id: 'cat-1',
  name: 'Salon',
  slug: 'salon',
}

const mockProduct: Product = {
  id: 'prod-1',
  name: 'Lampe de table Nordique',
  slug: 'lampe-table-nordique',
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

const mockCartItem: CartItemType = {
  id: 'cart-item-1',
  product: mockProduct,
  quantity: 2,
}

describe('CartItem', () => {
  beforeEach(() => {
    act(() => {
      useCartStore.getState().clearCart()
      useCartStore.getState().addItem(mockProduct, 2)
    })
  })

  describe('rendering', () => {
    it('should render product name', () => {
      render(<CartItem item={mockCartItem} />)
      expect(screen.getByText('Lampe de table Nordique')).toBeInTheDocument()
    })

    it('should render product image', () => {
      render(<CartItem item={mockCartItem} />)
      const img = screen.getByAltText('Lampe de table Nordique')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', 'image1.jpg')
    })

    it('should render category name in non-compact mode', () => {
      render(<CartItem item={mockCartItem} />)
      expect(screen.getByText('Salon')).toBeInTheDocument()
    })

    it('should not render category name in compact mode', () => {
      render(<CartItem item={mockCartItem} compact />)
      expect(screen.queryByText('Salon')).not.toBeInTheDocument()
    })

    it('should render quantity', () => {
      render(<CartItem item={mockCartItem} />)
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('should render total price', () => {
      render(<CartItem item={mockCartItem} />)
      // 89.99 * 2 = 179.98
      expect(screen.getByText(/179,98/)).toBeInTheDocument()
    })

    it('should render unit price when quantity > 1', () => {
      render(<CartItem item={mockCartItem} />)
      expect(screen.getByText(/89,99.*unité/i)).toBeInTheDocument()
    })

    it('should not render unit price when quantity is 1', () => {
      const singleItem: CartItemType = { ...mockCartItem, quantity: 1 }
      render(<CartItem item={singleItem} />)
      expect(screen.queryByText(/unité/)).not.toBeInTheDocument()
    })
  })

  describe('links', () => {
    it('should link to product page from image', () => {
      render(<CartItem item={mockCartItem} />)
      const links = screen.getAllByRole('link')
      const imageLink = links.find(link => link.querySelector('img'))
      expect(imageLink).toHaveAttribute('href', '/produits/lampe-table-nordique')
    })

    it('should link to product page from name', () => {
      render(<CartItem item={mockCartItem} />)
      const nameLink = screen.getByText('Lampe de table Nordique').closest('a')
      expect(nameLink).toHaveAttribute('href', '/produits/lampe-table-nordique')
    })
  })

  describe('quantity controls', () => {
    it('should render minus and plus buttons', () => {
      render(<CartItem item={mockCartItem} />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })

    it('should increase quantity when plus is clicked', () => {
      render(<CartItem item={mockCartItem} />)
      const buttons = screen.getAllByRole('button')
      const plusButton = buttons.find(btn => btn.querySelector('.lucide-plus'))

      if (plusButton) {
        fireEvent.click(plusButton)
        expect(useCartStore.getState().getItemQuantity('prod-1')).toBe(3)
      }
    })

    it('should decrease quantity when minus is clicked', () => {
      render(<CartItem item={mockCartItem} />)
      const buttons = screen.getAllByRole('button')
      const minusButton = buttons.find(btn => btn.querySelector('.lucide-minus'))

      if (minusButton) {
        fireEvent.click(minusButton)
        expect(useCartStore.getState().getItemQuantity('prod-1')).toBe(1)
      }
    })

    it('should disable minus button when quantity is 1', () => {
      const singleItem: CartItemType = { ...mockCartItem, quantity: 1 }
      act(() => {
        useCartStore.getState().clearCart()
        useCartStore.getState().addItem(mockProduct, 1)
      })

      render(<CartItem item={singleItem} />)
      const buttons = screen.getAllByRole('button')
      const minusButton = buttons.find(btn => btn.querySelector('.lucide-minus'))
      expect(minusButton).toBeDisabled()
    })

    it('should disable plus button when quantity equals stock', () => {
      const maxItem: CartItemType = { ...mockCartItem, quantity: 10 }
      act(() => {
        useCartStore.getState().clearCart()
        useCartStore.getState().addItem(mockProduct, 10)
      })

      render(<CartItem item={maxItem} />)
      const buttons = screen.getAllByRole('button')
      const plusButton = buttons.find(btn => btn.querySelector('.lucide-plus'))
      expect(plusButton).toBeDisabled()
    })
  })

  describe('remove button', () => {
    it('should render remove button in non-compact mode', () => {
      render(<CartItem item={mockCartItem} />)
      // In non-compact mode: minus, plus, trash = 3 buttons
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBe(3)
    })

    it('should render remove button in compact mode', () => {
      render(<CartItem item={mockCartItem} compact />)
      // In compact mode: minus, plus, trash = 3 buttons
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBe(3)
    })

    it('should remove item when trash button is clicked', () => {
      render(<CartItem item={mockCartItem} />)
      // The third button is the trash button
      const buttons = screen.getAllByRole('button')
      const trashButton = buttons[2]

      fireEvent.click(trashButton)
      expect(useCartStore.getState().isInCart('prod-1')).toBe(false)
    })
  })

  describe('compact mode', () => {
    it('should use smaller image in compact mode', () => {
      const { container } = render(<CartItem item={mockCartItem} compact />)
      const imageContainer = container.querySelector('.w-16')
      expect(imageContainer).toBeInTheDocument()
    })

    it('should use smaller text in compact mode', () => {
      const { container } = render(<CartItem item={mockCartItem} compact />)
      const smallText = container.querySelector('.text-sm')
      expect(smallText).toBeInTheDocument()
    })
  })
})

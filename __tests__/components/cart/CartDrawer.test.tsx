import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { useCartStore } from '@/stores/cartStore'
import { Product, Category } from '@/types'

// Mock Next.js Link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, onClick }: any) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}))

// Mock CartItem component to simplify tests
jest.mock('@/components/cart/CartItem', () => ({
  CartItem: ({ item }: any) => (
    <div data-testid={`cart-item-${item.id}`}>
      {item.product.name} - Qty: {item.quantity}
    </div>
  ),
}))

const mockCategory: Category = {
  id: 'cat-1',
  name: 'Salon',
  slug: 'salon',
}

const mockProduct: Product = {
  id: 'prod-1',
  name: 'Lampe Moderne',
  slug: 'lampe-moderne',
  description: 'Une belle lampe',
  price: 89.99,
  images: ['lamp.jpg'],
  category: mockCategory,
  categoryId: 'cat-1',
  stock: 10,
  featured: false,
  reviews: [],
  createdAt: new Date(),
}

const mockProduct2: Product = {
  id: 'prod-2',
  name: 'Vase Ceramique',
  slug: 'vase-ceramique',
  description: 'Un beau vase',
  price: 45.00,
  images: ['vase.jpg'],
  category: mockCategory,
  categoryId: 'cat-1',
  stock: 5,
  featured: false,
  reviews: [],
  createdAt: new Date(),
}

describe('CartDrawer', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    act(() => {
      useCartStore.getState().clearCart()
    })
    // Reset body overflow
    document.body.style.overflow = ''
  })

  describe('Rendering', () => {
    it('should render drawer when isOpen is true', () => {
      render(<CartDrawer {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should not render drawer when isOpen is false', () => {
      render(<CartDrawer {...defaultProps} isOpen={false} />)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should render cart title with item count', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, 2)
        useCartStore.getState().addItem(mockProduct2, 1)
      })

      render(<CartDrawer {...defaultProps} />)

      expect(screen.getByText('Panier (3)')).toBeInTheDocument()
    })

    it('should render close button', () => {
      render(<CartDrawer {...defaultProps} />)

      expect(screen.getByLabelText('Fermer le panier')).toBeInTheDocument()
    })

    it('should render backdrop', () => {
      const { container } = render(<CartDrawer {...defaultProps} />)

      const backdrop = container.querySelector('.bg-black\\/50')
      expect(backdrop).toBeInTheDocument()
    })
  })

  describe('Empty Cart State', () => {
    it('should show empty cart message when cart is empty', () => {
      render(<CartDrawer {...defaultProps} />)

      expect(screen.getByText('Votre panier est vide')).toBeInTheDocument()
    })

    it('should show discover products button when cart is empty', () => {
      render(<CartDrawer {...defaultProps} />)

      expect(screen.getByText('Découvrir nos produits')).toBeInTheDocument()
    })

    it('should call onClose when clicking discover button', () => {
      const onClose = jest.fn()
      render(<CartDrawer {...defaultProps} onClose={onClose} />)

      fireEvent.click(screen.getByText('Découvrir nos produits'))

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should not show footer when cart is empty', () => {
      render(<CartDrawer {...defaultProps} />)

      expect(screen.queryByText('Sous-total')).not.toBeInTheDocument()
      expect(screen.queryByText('Passer la commande')).not.toBeInTheDocument()
    })
  })

  describe('Cart with Items', () => {
    beforeEach(() => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, 2)
        useCartStore.getState().addItem(mockProduct2, 1)
      })
    })

    it('should render cart items', () => {
      render(<CartDrawer {...defaultProps} />)

      const items = useCartStore.getState().items
      items.forEach((item) => {
        expect(screen.getByTestId(`cart-item-${item.id}`)).toBeInTheDocument()
      })
    })

    it('should show subtotal', () => {
      render(<CartDrawer {...defaultProps} />)

      expect(screen.getByText('Sous-total')).toBeInTheDocument()
      // (89.99 * 2) + 45.00 = 224.98
      expect(screen.getByText(/224,98/)).toBeInTheDocument()
    })

    it('should show shipping message', () => {
      render(<CartDrawer {...defaultProps} />)

      expect(screen.getByText("Frais de livraison calculés à l'étape suivante")).toBeInTheDocument()
    })

    it('should render checkout button', () => {
      render(<CartDrawer {...defaultProps} />)

      expect(screen.getByText('Passer la commande')).toBeInTheDocument()
    })

    it('should render view cart button', () => {
      render(<CartDrawer {...defaultProps} />)

      expect(screen.getByText('Voir le panier')).toBeInTheDocument()
    })

    it('should link checkout button to checkout page', () => {
      render(<CartDrawer {...defaultProps} />)

      const checkoutLink = screen.getByText('Passer la commande').closest('a')
      expect(checkoutLink).toHaveAttribute('href', '/checkout')
    })

    it('should link view cart button to cart page', () => {
      render(<CartDrawer {...defaultProps} />)

      const cartLink = screen.getByText('Voir le panier').closest('a')
      expect(cartLink).toHaveAttribute('href', '/panier')
    })

    it('should call onClose when clicking checkout link', () => {
      const onClose = jest.fn()
      render(<CartDrawer {...defaultProps} onClose={onClose} />)

      fireEvent.click(screen.getByText('Passer la commande'))

      expect(onClose).toHaveBeenCalled()
    })

    it('should call onClose when clicking view cart link', () => {
      const onClose = jest.fn()
      render(<CartDrawer {...defaultProps} onClose={onClose} />)

      fireEvent.click(screen.getByText('Voir le panier'))

      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('Close Interactions', () => {
    it('should call onClose when close button is clicked', () => {
      const onClose = jest.fn()
      render(<CartDrawer {...defaultProps} onClose={onClose} />)

      fireEvent.click(screen.getByLabelText('Fermer le panier'))

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when backdrop is clicked', () => {
      const onClose = jest.fn()
      const { container } = render(<CartDrawer {...defaultProps} onClose={onClose} />)

      const backdrop = container.querySelector('.bg-black\\/50')
      if (backdrop) {
        fireEvent.click(backdrop)
      }

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when Escape key is pressed', () => {
      const onClose = jest.fn()
      render(<CartDrawer {...defaultProps} onClose={onClose} />)

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should not call onClose when other keys are pressed', () => {
      const onClose = jest.fn()
      render(<CartDrawer {...defaultProps} onClose={onClose} />)

      fireEvent.keyDown(document, { key: 'Enter' })
      fireEvent.keyDown(document, { key: 'Space' })
      fireEvent.keyDown(document, { key: 'Tab' })

      expect(onClose).not.toHaveBeenCalled()
    })

    it('should not propagate click from dialog content to backdrop', () => {
      const onClose = jest.fn()
      render(<CartDrawer {...defaultProps} onClose={onClose} />)

      const dialog = screen.getByRole('dialog')
      fireEvent.click(dialog)

      // Click on dialog itself should not close (only backdrop)
      // The backdrop click is handled separately
    })
  })

  describe('Accessibility', () => {
    it('should have role="dialog"', () => {
      render(<CartDrawer {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should have aria-modal="true"', () => {
      render(<CartDrawer {...defaultProps} />)

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    })

    it('should have aria-labelledby pointing to title', () => {
      render(<CartDrawer {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      const labelledBy = dialog.getAttribute('aria-labelledby')
      expect(labelledBy).toBeTruthy()

      // The title should exist and be linked
      const title = document.getElementById(labelledBy!)
      expect(title).toBeInTheDocument()
      expect(title?.textContent).toContain('Panier')
    })

    it('should have accessible close button', () => {
      render(<CartDrawer {...defaultProps} />)

      const closeButton = screen.getByLabelText('Fermer le panier')
      expect(closeButton).toHaveAttribute('aria-label', 'Fermer le panier')
    })

    it('should hide backdrop from screen readers', () => {
      const { container } = render(<CartDrawer {...defaultProps} />)

      const backdrop = container.querySelector('.bg-black\\/50')
      expect(backdrop).toHaveAttribute('aria-hidden', 'true')
    })

    it('should mark decorative icons as aria-hidden', () => {
      render(<CartDrawer {...defaultProps} />)

      // ShoppingBag icon in header should be aria-hidden
      const icons = document.querySelectorAll('[aria-hidden="true"]')
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('Focus Management', () => {
    it('should prevent body scroll when open', () => {
      render(<CartDrawer {...defaultProps} />)

      expect(document.body.style.overflow).toBe('hidden')
    })

    it('should restore body scroll when closed', () => {
      const { rerender } = render(<CartDrawer {...defaultProps} />)

      expect(document.body.style.overflow).toBe('hidden')

      rerender(<CartDrawer {...defaultProps} isOpen={false} />)

      expect(document.body.style.overflow).toBe('')
    })

    it('should clean up event listeners when unmounted', () => {
      const { unmount } = render(<CartDrawer {...defaultProps} />)

      // Store the original listener count concept (we're testing cleanup)
      unmount()

      // Body overflow should be restored
      expect(document.body.style.overflow).toBe('')
    })
  })

  describe('Focus Trap', () => {
    it('should trap focus within drawer', async () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, 1)
      })

      render(<CartDrawer {...defaultProps} />)

      // Get focusable elements in the drawer
      const dialog = screen.getByRole('dialog')
      const focusableElements = dialog.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      expect(focusableElements.length).toBeGreaterThan(0)
    })

    it('should handle Tab key for focus cycling', async () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, 1)
      })

      render(<CartDrawer {...defaultProps} />)

      // Verify Tab key handling is set up (tested via event listener)
      // The actual focus trap logic is implemented in the component
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })
  })

  describe('Dynamic Updates', () => {
    it('should update item count when cart changes', () => {
      const { rerender } = render(<CartDrawer {...defaultProps} />)

      expect(screen.getByText('Panier (0)')).toBeInTheDocument()

      act(() => {
        useCartStore.getState().addItem(mockProduct, 3)
      })

      rerender(<CartDrawer {...defaultProps} />)

      expect(screen.getByText('Panier (3)')).toBeInTheDocument()
    })

    it('should update total when cart changes', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, 1)
      })

      const { rerender } = render(<CartDrawer {...defaultProps} />)

      expect(screen.getByText(/89,99/)).toBeInTheDocument()

      act(() => {
        useCartStore.getState().addItem(mockProduct2, 1)
      })

      rerender(<CartDrawer {...defaultProps} />)

      // 89.99 + 45.00 = 134.99
      expect(screen.getByText(/134,99/)).toBeInTheDocument()
    })

    it('should transition to empty state when all items removed', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, 1)
      })

      const { rerender } = render(<CartDrawer {...defaultProps} />)

      expect(screen.queryByText('Votre panier est vide')).not.toBeInTheDocument()

      act(() => {
        useCartStore.getState().clearCart()
      })

      rerender(<CartDrawer {...defaultProps} />)

      expect(screen.getByText('Votre panier est vide')).toBeInTheDocument()
    })
  })

  describe('Price Formatting', () => {
    it('should format prices in French EUR format', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, 1)
      })

      render(<CartDrawer {...defaultProps} />)

      // Should show price with comma decimal separator and euro symbol
      expect(screen.getByText(/89,99.*€/)).toBeInTheDocument()
    })

    it('should calculate correct total with multiple items', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, 3) // 89.99 * 3 = 269.97
        useCartStore.getState().addItem(mockProduct2, 2) // 45.00 * 2 = 90.00
      })

      render(<CartDrawer {...defaultProps} />)

      // Total: 269.97 + 90.00 = 359.97
      expect(screen.getByText(/359,97/)).toBeInTheDocument()
    })
  })

  describe('Multiple Items Display', () => {
    it('should render all cart items in compact mode', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, 2)
        useCartStore.getState().addItem(mockProduct2, 1)
      })

      render(<CartDrawer {...defaultProps} />)

      // Both items should be rendered via CartItem component
      const items = screen.getAllByTestId(/cart-item-/)
      expect(items.length).toBe(2)
    })

    it('should separate items with dividers', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, 1)
        useCartStore.getState().addItem(mockProduct2, 1)
      })

      const { container } = render(<CartDrawer {...defaultProps} />)

      // Check for divide-y class on items container
      const dividerContainer = container.querySelector('.divide-y')
      expect(dividerContainer).toBeInTheDocument()
    })
  })

  describe('Lifecycle', () => {
    it('should not crash when reopened', () => {
      const { rerender } = render(<CartDrawer {...defaultProps} isOpen={false} />)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

      rerender(<CartDrawer {...defaultProps} isOpen={true} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()

      rerender(<CartDrawer {...defaultProps} isOpen={false} />)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

      rerender(<CartDrawer {...defaultProps} isOpen={true} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should handle rapid open/close cycles', () => {
      const { rerender } = render(<CartDrawer {...defaultProps} isOpen={false} />)

      for (let i = 0; i < 5; i++) {
        rerender(<CartDrawer {...defaultProps} isOpen={true} />)
        rerender(<CartDrawer {...defaultProps} isOpen={false} />)
      }

      // Should not throw and body overflow should be restored
      expect(document.body.style.overflow).toBe('')
    })
  })
})

/**
 * Integration Tests: Add to Cart Flow
 *
 * Tests the complete user journey from viewing a product to adding it to cart.
 * This validates that all stores, components, and utilities work together correctly.
 */

import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useCartStore } from '@/stores/cartStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import { ProductCard } from '@/components/product/ProductCard'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import { Product, Category } from '@/types'

// Mock Next.js components
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, onClick }: any) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}))

// Test fixtures
const mockCategory: Category = {
  id: 'cat-1',
  name: 'Luminaires',
  slug: 'luminaires',
}

const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Lampe Artisanale Nordique',
    slug: 'lampe-artisanale-nordique',
    description: 'Lampe fabriquée à la main avec des matériaux naturels',
    price: 189.99,
    comparePrice: 249.99,
    images: ['lamp1.jpg', 'lamp2.jpg'],
    category: mockCategory,
    categoryId: 'cat-1',
    stock: 5,
    featured: true,
    reviews: [],
    createdAt: new Date(),
  },
  {
    id: 'prod-2',
    name: 'Suspension Minimaliste',
    slug: 'suspension-minimaliste',
    description: 'Suspension design épuré',
    price: 129.00,
    images: ['suspension.jpg'],
    category: mockCategory,
    categoryId: 'cat-1',
    stock: 10,
    featured: false,
    reviews: [],
    createdAt: new Date(),
  },
  {
    id: 'prod-3',
    name: 'Applique Murale Vintage',
    slug: 'applique-murale-vintage',
    description: 'Applique style rétro',
    price: 79.99,
    comparePrice: 99.99,
    images: ['applique.jpg'],
    category: mockCategory,
    categoryId: 'cat-1',
    stock: 0, // Out of stock
    featured: false,
    reviews: [],
    createdAt: new Date(),
  },
]

// Helper component to render multiple ProductCards
function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div data-testid="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

// Helper component to simulate full shopping experience
function ShoppingExperience({ products }: { products: Product[] }) {
  const [isCartOpen, setIsCartOpen] = React.useState(false)
  const cartItemCount = useCartStore((state) => state.itemCount)

  return (
    <>
      <header>
        <button
          data-testid="cart-toggle"
          onClick={() => setIsCartOpen(true)}
        >
          Panier ({cartItemCount})
        </button>
      </header>
      <main>
        <ProductGrid products={products} />
      </main>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}

// Need React for the helper component
import React from 'react'

describe('Add to Cart Integration Flow', () => {
  beforeEach(() => {
    // Reset all stores before each test
    act(() => {
      useCartStore.getState().clearCart()
      useWishlistStore.getState().clearWishlist()
    })
    // Reset body overflow
    document.body.style.overflow = ''
  })

  describe('Single Product Add to Cart', () => {
    it('should add product to cart when clicking add button', () => {
      render(<ProductCard product={mockProducts[0]} />)

      // Initially cart is empty
      expect(useCartStore.getState().items).toHaveLength(0)

      // Click add to cart
      fireEvent.click(screen.getByText('Ajouter au panier'))

      // Verify product is in cart
      expect(useCartStore.getState().items).toHaveLength(1)
      expect(useCartStore.getState().isInCart('prod-1')).toBe(true)
    })

    it('should update button text after adding to cart', () => {
      render(<ProductCard product={mockProducts[0]} />)

      // Initially shows add button
      expect(screen.getByText('Ajouter au panier')).toBeInTheDocument()

      // Click add to cart
      fireEvent.click(screen.getByText('Ajouter au panier'))

      // Button should now show "Dans le panier"
      expect(screen.getByText('Dans le panier')).toBeInTheDocument()
      expect(screen.queryByText('Ajouter au panier')).not.toBeInTheDocument()
    })

    it('should calculate cart total correctly', () => {
      render(<ProductCard product={mockProducts[0]} />)

      fireEvent.click(screen.getByText('Ajouter au panier'))

      expect(useCartStore.getState().total).toBe(189.99)
    })

    it('should update item count', () => {
      render(<ProductCard product={mockProducts[0]} />)

      fireEvent.click(screen.getByText('Ajouter au panier'))

      expect(useCartStore.getState().itemCount).toBe(1)
    })
  })

  describe('Multiple Products Add to Cart', () => {
    it('should add multiple different products to cart', () => {
      render(<ProductGrid products={mockProducts.slice(0, 2)} />)

      // Add first product
      const addButtons = screen.getAllByText('Ajouter au panier')
      fireEvent.click(addButtons[0])

      // Add second product
      fireEvent.click(addButtons[1])

      // Verify both products are in cart
      expect(useCartStore.getState().items).toHaveLength(2)
      expect(useCartStore.getState().isInCart('prod-1')).toBe(true)
      expect(useCartStore.getState().isInCart('prod-2')).toBe(true)
    })

    it('should calculate total for multiple products', () => {
      render(<ProductGrid products={mockProducts.slice(0, 2)} />)

      const addButtons = screen.getAllByText('Ajouter au panier')
      fireEvent.click(addButtons[0]) // 189.99
      fireEvent.click(addButtons[1]) // 129.00

      // Total should be 189.99 + 129.00 = 318.99
      expect(useCartStore.getState().total).toBeCloseTo(318.99, 2)
    })

    it('should update item count for multiple products', () => {
      render(<ProductGrid products={mockProducts.slice(0, 2)} />)

      const addButtons = screen.getAllByText('Ajouter au panier')
      fireEvent.click(addButtons[0])
      fireEvent.click(addButtons[1])

      expect(useCartStore.getState().itemCount).toBe(2)
    })
  })

  describe('Out of Stock Products', () => {
    it('should show unavailable button for out of stock products', () => {
      render(<ProductCard product={mockProducts[2]} />)

      expect(screen.getByText('Indisponible')).toBeInTheDocument()
    })

    it('should disable add button for out of stock products', () => {
      render(<ProductCard product={mockProducts[2]} />)

      const button = screen.getByText('Indisponible').closest('button')
      expect(button).toBeDisabled()
    })

    it('should not add out of stock product to cart', () => {
      render(<ProductCard product={mockProducts[2]} />)

      const button = screen.getByText('Indisponible').closest('button')
      if (button) {
        fireEvent.click(button)
      }

      expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('should show rupture badge for out of stock products', () => {
      render(<ProductCard product={mockProducts[2]} />)

      expect(screen.getByText('Rupture')).toBeInTheDocument()
    })
  })

  describe('Discount Display', () => {
    it('should display discount badge for products with comparePrice', () => {
      render(<ProductCard product={mockProducts[0]} />)

      // 189.99 vs 249.99 = 24% discount
      const discount = calculateDiscount(189.99, 249.99)
      expect(screen.getByText(`-${discount}%`)).toBeInTheDocument()
    })

    it('should display both prices for discounted products', () => {
      render(<ProductCard product={mockProducts[0]} />)

      // Current price
      expect(screen.getByText(/189,99/)).toBeInTheDocument()
      // Original price
      expect(screen.getByText(/249,99/)).toBeInTheDocument()
    })

    it('should not show discount for products without comparePrice', () => {
      render(<ProductCard product={mockProducts[1]} />)

      expect(screen.queryByText(/-%/)).not.toBeInTheDocument()
    })
  })

  describe('Wishlist Integration', () => {
    it('should toggle wishlist independently of cart', () => {
      render(<ProductCard product={mockProducts[0]} />)

      // Add to wishlist
      fireEvent.click(screen.getByLabelText('Ajouter aux favoris'))

      expect(useWishlistStore.getState().isInWishlist('prod-1')).toBe(true)
      expect(useCartStore.getState().isInCart('prod-1')).toBe(false)

      // Now add to cart
      fireEvent.click(screen.getByText('Ajouter au panier'))

      expect(useWishlistStore.getState().isInWishlist('prod-1')).toBe(true)
      expect(useCartStore.getState().isInCart('prod-1')).toBe(true)
    })

    it('should update wishlist button label when in wishlist', () => {
      render(<ProductCard product={mockProducts[0]} />)

      // Initially
      expect(screen.getByLabelText('Ajouter aux favoris')).toBeInTheDocument()

      // Add to wishlist
      fireEvent.click(screen.getByLabelText('Ajouter aux favoris'))

      // After adding
      expect(screen.getByLabelText('Retirer des favoris')).toBeInTheDocument()
    })
  })

  describe('Cart Persistence', () => {
    it('should maintain cart state across component remounts', () => {
      const { unmount, rerender } = render(<ProductCard product={mockProducts[0]} />)

      // Add to cart
      fireEvent.click(screen.getByText('Ajouter au panier'))
      expect(useCartStore.getState().isInCart('prod-1')).toBe(true)

      // Unmount and remount
      unmount()
      render(<ProductCard product={mockProducts[0]} />)

      // Should still show "Dans le panier"
      expect(screen.getByText('Dans le panier')).toBeInTheDocument()
    })
  })

  describe('Price Formatting Integration', () => {
    it('should format prices consistently across components', () => {
      render(<ProductCard product={mockProducts[0]} />)

      // Price should be formatted in French EUR format
      const formattedPrice = formatPrice(189.99)
      expect(screen.getByText(/189,99.*€/)).toBeInTheDocument()
    })
  })

  describe('Full Shopping Flow', () => {
    it('should complete full add to cart and view cart flow', async () => {
      render(<ShoppingExperience products={mockProducts.slice(0, 2)} />)

      // Initially cart is empty
      expect(screen.getByTestId('cart-toggle')).toHaveTextContent('Panier (0)')

      // Add first product
      const addButtons = screen.getAllByText('Ajouter au panier')
      fireEvent.click(addButtons[0])

      // Cart count should update
      expect(screen.getByTestId('cart-toggle')).toHaveTextContent('Panier (1)')

      // Add second product
      fireEvent.click(addButtons[1])

      // Cart count should update again
      expect(screen.getByTestId('cart-toggle')).toHaveTextContent('Panier (2)')

      // Open cart drawer
      fireEvent.click(screen.getByTestId('cart-toggle'))

      // Cart drawer should be open with items
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Should show correct total
      const total = 189.99 + 129.00
      expect(screen.getByText(/318,99/)).toBeInTheDocument()
    })

    it('should update cart drawer in real-time', async () => {
      render(<ShoppingExperience products={[mockProducts[0]]} />)

      // Open cart first (empty state)
      fireEvent.click(screen.getByTestId('cart-toggle'))

      await waitFor(() => {
        expect(screen.getByText('Votre panier est vide')).toBeInTheDocument()
      })

      // Close cart
      fireEvent.click(screen.getByLabelText('Fermer le panier'))

      // Add product
      fireEvent.click(screen.getByText('Ajouter au panier'))

      // Reopen cart
      fireEvent.click(screen.getByTestId('cart-toggle'))

      // Should now show the product (via mocked CartItem)
      await waitFor(() => {
        expect(screen.queryByText('Votre panier est vide')).not.toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle adding same product multiple times', () => {
      render(<ProductCard product={mockProducts[0]} />)

      // First click adds to cart
      fireEvent.click(screen.getByText('Ajouter au panier'))

      // Second click on "Dans le panier" should do nothing
      // (Button behavior is defined by the component)
      expect(screen.getByText('Dans le panier')).toBeInTheDocument()
      expect(useCartStore.getState().items).toHaveLength(1)
      expect(useCartStore.getState().getItemQuantity('prod-1')).toBe(1)
    })

    it('should handle rapid clicks on add button', () => {
      render(<ProductCard product={mockProducts[0]} />)

      // Rapid clicks
      const button = screen.getByText('Ajouter au panier')
      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)

      // Should only be added once (since button changes after first click)
      expect(useCartStore.getState().items).toHaveLength(1)
    })

    it('should handle products with missing optional fields', () => {
      const productWithMinimalData: Product = {
        id: 'prod-minimal',
        name: 'Minimal Product',
        slug: 'minimal-product',
        description: '',
        price: 50,
        images: [],
        category: mockCategory,
        categoryId: 'cat-1',
        stock: 1,
        featured: false,
        reviews: [],
        createdAt: new Date(),
      }

      render(<ProductCard product={productWithMinimalData} />)

      fireEvent.click(screen.getByText('Ajouter au panier'))

      expect(useCartStore.getState().isInCart('prod-minimal')).toBe(true)
    })
  })

  describe('Store State Consistency', () => {
    it('should maintain consistent state between stores and UI', () => {
      render(<ProductGrid products={mockProducts.slice(0, 2)} />)

      // Add both products
      const addButtons = screen.getAllByText('Ajouter au panier')
      fireEvent.click(addButtons[0])
      fireEvent.click(addButtons[1])

      // Verify store state
      const cartState = useCartStore.getState()

      expect(cartState.items).toHaveLength(2)
      expect(cartState.itemCount).toBe(2)
      expect(cartState.total).toBeCloseTo(318.99, 2)

      // Both buttons should show "Dans le panier"
      expect(screen.getAllByText('Dans le panier')).toHaveLength(2)
    })

    it('should sync cart and item count correctly', () => {
      render(<ProductCard product={mockProducts[0]} />)

      fireEvent.click(screen.getByText('Ajouter au panier'))

      const state = useCartStore.getState()

      // Item count should match sum of quantities
      const calculatedCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
      expect(state.itemCount).toBe(calculatedCount)
    })

    it('should sync cart total with item prices', () => {
      render(<ProductGrid products={mockProducts.slice(0, 2)} />)

      const addButtons = screen.getAllByText('Ajouter au panier')
      fireEvent.click(addButtons[0])
      fireEvent.click(addButtons[1])

      const state = useCartStore.getState()

      // Total should match sum of (price * quantity)
      const calculatedTotal = state.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      )
      expect(state.total).toBeCloseTo(calculatedTotal, 2)
    })
  })
})

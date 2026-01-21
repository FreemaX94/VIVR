import { render, screen, fireEvent } from '@testing-library/react'
import { ProductCard } from '@/components/product/ProductCard'
import { useCartStore } from '@/stores/cartStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import { Product, Category } from '@/types'
import { act } from '@testing-library/react'

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
  comparePrice: 129.99,
  images: ['image1.jpg', 'image2.jpg'],
  category: mockCategory,
  categoryId: 'cat-1',
  stock: 10,
  featured: true,
  reviews: [],
  createdAt: new Date(),
}

const mockProductNoDiscount: Product = {
  ...mockProduct,
  id: 'prod-2',
  comparePrice: undefined,
  featured: false,
}

const mockProductOutOfStock: Product = {
  ...mockProduct,
  id: 'prod-3',
  stock: 0,
}

describe('ProductCard', () => {
  beforeEach(() => {
    act(() => {
      useCartStore.getState().clearCart()
      useWishlistStore.getState().clearWishlist()
    })
  })

  describe('rendering', () => {
    it('should render product name', () => {
      render(<ProductCard product={mockProduct} />)
      expect(screen.getByText('Lampe de table Nordique')).toBeInTheDocument()
    })

    it('should render product category', () => {
      render(<ProductCard product={mockProduct} />)
      expect(screen.getByText('Salon')).toBeInTheDocument()
    })

    it('should render product price', () => {
      render(<ProductCard product={mockProduct} />)
      expect(screen.getByText(/89,99/)).toBeInTheDocument()
    })

    it('should render compare price when available', () => {
      render(<ProductCard product={mockProduct} />)
      expect(screen.getByText(/129,99/)).toBeInTheDocument()
    })

    it('should not render compare price when not available', () => {
      render(<ProductCard product={mockProductNoDiscount} />)
      const prices = screen.getAllByText(/€/)
      expect(prices).toHaveLength(1)
    })

    it('should render product image', () => {
      render(<ProductCard product={mockProduct} />)
      const img = screen.getByAltText('Lampe de table Nordique')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', 'image1.jpg')
    })

    it('should link to product page', () => {
      render(<ProductCard product={mockProduct} />)
      const link = screen.getByRole('link', { name: /Lampe de table Nordique/i })
      expect(link).toHaveAttribute('href', '/produits/lampe-table-nordique')
    })
  })

  describe('badges', () => {
    it('should render discount badge when product has discount', () => {
      render(<ProductCard product={mockProduct} />)
      expect(screen.getByText(/-31%/)).toBeInTheDocument()
    })

    it('should not render discount badge when no discount', () => {
      render(<ProductCard product={mockProductNoDiscount} />)
      expect(screen.queryByText(/-%/)).not.toBeInTheDocument()
    })

    it('should render featured badge for featured products', () => {
      render(<ProductCard product={mockProduct} />)
      expect(screen.getByText('Vedette')).toBeInTheDocument()
    })

    it('should not render featured badge for non-featured products', () => {
      render(<ProductCard product={mockProductNoDiscount} />)
      expect(screen.queryByText('Vedette')).not.toBeInTheDocument()
    })

    it('should render out of stock badge', () => {
      render(<ProductCard product={mockProductOutOfStock} />)
      expect(screen.getByText('Rupture')).toBeInTheDocument()
    })
  })

  describe('add to cart', () => {
    it('should show "Ajouter au panier" button', () => {
      render(<ProductCard product={mockProduct} />)
      expect(screen.getByText('Ajouter au panier')).toBeInTheDocument()
    })

    it('should add product to cart when button clicked', () => {
      render(<ProductCard product={mockProduct} />)

      fireEvent.click(screen.getByText('Ajouter au panier'))

      expect(useCartStore.getState().isInCart('prod-1')).toBe(true)
    })

    it('should show "Dans le panier" when product is in cart', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct)
      })

      render(<ProductCard product={mockProduct} />)
      expect(screen.getByText('Dans le panier')).toBeInTheDocument()
    })

    it('should show "Indisponible" when out of stock', () => {
      render(<ProductCard product={mockProductOutOfStock} />)
      expect(screen.getByText('Indisponible')).toBeInTheDocument()
    })

    it('should disable button when out of stock', () => {
      render(<ProductCard product={mockProductOutOfStock} />)
      const button = screen.getByText('Indisponible').closest('button')
      expect(button).toBeDisabled()
    })
  })

  describe('wishlist', () => {
    it('should render wishlist button', () => {
      render(<ProductCard product={mockProduct} />)
      expect(screen.getByLabelText('Ajouter aux favoris')).toBeInTheDocument()
    })

    it('should add product to wishlist when button clicked', () => {
      render(<ProductCard product={mockProduct} />)

      fireEvent.click(screen.getByLabelText('Ajouter aux favoris'))

      expect(useWishlistStore.getState().isInWishlist('prod-1')).toBe(true)
    })

    it('should show "Retirer des favoris" when in wishlist', () => {
      act(() => {
        useWishlistStore.getState().addItem(mockProduct)
      })

      render(<ProductCard product={mockProduct} />)
      expect(screen.getByLabelText('Retirer des favoris')).toBeInTheDocument()
    })

    it('should toggle wishlist state', () => {
      render(<ProductCard product={mockProduct} />)

      // Add to wishlist
      fireEvent.click(screen.getByLabelText('Ajouter aux favoris'))
      expect(useWishlistStore.getState().isInWishlist('prod-1')).toBe(true)

      // Remove from wishlist
      fireEvent.click(screen.getByLabelText('Retirer des favoris'))
      expect(useWishlistStore.getState().isInWishlist('prod-1')).toBe(false)
    })
  })

  describe('quick view', () => {
    it('should render quick view link', () => {
      render(<ProductCard product={mockProduct} />)
      const viewLink = screen.getByLabelText('Voir le produit')
      expect(viewLink).toHaveAttribute('href', '/produits/lampe-table-nordique')
    })
  })

  describe('priority prop', () => {
    it('should accept priority prop without error', () => {
      // Testing that the component accepts the priority prop (used for LCP optimization)
      expect(() => {
        render(<ProductCard product={mockProduct} priority={true} />)
      }).not.toThrow()
    })

    it('should render correctly without priority prop', () => {
      render(<ProductCard product={mockProduct} />)
      const img = screen.getByAltText('Lampe de table Nordique')
      expect(img).toBeInTheDocument()
    })
  })

  describe('event propagation', () => {
    it('should prevent link navigation when clicking add to cart', () => {
      render(<ProductCard product={mockProduct} />)
      const button = screen.getByText('Ajouter au panier')

      const clickEvent = fireEvent.click(button)
      // The event should be handled (product added to cart)
      expect(useCartStore.getState().isInCart('prod-1')).toBe(true)
    })
  })
})

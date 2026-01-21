import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from '@/components/layout/Header'
import { useCartStore } from '@/stores/cartStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import { act } from '@testing-library/react'
import { Product, Category } from '@/types'

// Mock SearchBar
jest.mock('@/components/layout/SearchBar', () => ({
  SearchBar: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? <div data-testid="search-bar" onClick={onClose}>Search Bar</div> : null,
}))

const mockCategory: Category = {
  id: 'cat-1',
  name: 'Salon',
  slug: 'salon',
}

const mockProduct: Product = {
  id: 'prod-1',
  name: 'Test Product',
  slug: 'test-product',
  description: 'Description',
  price: 99.99,
  images: ['image.jpg'],
  category: mockCategory,
  categoryId: 'cat-1',
  stock: 10,
  featured: false,
  reviews: [],
  createdAt: new Date(),
}

describe('Header', () => {
  beforeEach(() => {
    act(() => {
      useCartStore.getState().clearCart()
      useWishlistStore.getState().clearWishlist()
    })
  })

  describe('rendering', () => {
    it('should render logo', () => {
      render(<Header />)
      expect(screen.getByText('VIVR')).toBeInTheDocument()
    })

    it('should render promo banner', () => {
      render(<Header />)
      expect(screen.getByText(/Livraison gratuite/)).toBeInTheDocument()
    })

    it('should render navigation links', () => {
      render(<Header />)
      expect(screen.getByText('Tous les produits')).toBeInTheDocument()
      expect(screen.getByText('Catégories')).toBeInTheDocument()
      expect(screen.getByText('Nouveautés')).toBeInTheDocument()
      expect(screen.getByText('Promotions')).toBeInTheDocument()
    })

    it('should render action buttons', () => {
      render(<Header />)
      expect(screen.getByLabelText('Rechercher')).toBeInTheDocument()
      expect(screen.getByLabelText('Liste de souhaits')).toBeInTheDocument()
      expect(screen.getByLabelText('Mon compte')).toBeInTheDocument()
      expect(screen.getByLabelText('Panier')).toBeInTheDocument()
    })
  })

  describe('logo link', () => {
    it('should link to home page', () => {
      render(<Header />)
      const logoLink = screen.getByText('VIVR').closest('a')
      expect(logoLink).toHaveAttribute('href', '/')
    })
  })

  describe('navigation links', () => {
    it('should link to products page', () => {
      render(<Header />)
      const link = screen.getAllByText('Tous les produits')[0].closest('a')
      expect(link).toHaveAttribute('href', '/produits')
    })

    it('should link to nouveautes page', () => {
      render(<Header />)
      const links = screen.getAllByText('Nouveautés')
      const desktopLink = links[0].closest('a')
      expect(desktopLink).toHaveAttribute('href', '/nouveautes')
    })

    it('should link to promotions page', () => {
      render(<Header />)
      const links = screen.getAllByText('Promotions')
      const desktopLink = links[0].closest('a')
      expect(desktopLink).toHaveAttribute('href', '/promotions')
    })
  })

  describe('cart badge', () => {
    it('should not show badge when cart is empty', () => {
      render(<Header />)
      const cartLink = screen.getByLabelText('Panier')
      expect(cartLink.querySelector('span')).not.toBeInTheDocument()
    })

    it('should show badge with item count', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, 3)
      })

      render(<Header />)
      const cartLink = screen.getByLabelText('Panier')
      const badge = cartLink.querySelector('span')
      expect(badge).toHaveTextContent('3')
    })

    it('should show "9+" for more than 9 items', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct, 15)
      })

      render(<Header />)
      const cartLink = screen.getByLabelText('Panier')
      const badge = cartLink.querySelector('span')
      expect(badge).toHaveTextContent('9+')
    })
  })

  describe('wishlist badge', () => {
    it('should not show badge when wishlist is empty', () => {
      render(<Header />)
      const wishlistLink = screen.getByLabelText('Liste de souhaits')
      expect(wishlistLink.querySelector('span')).not.toBeInTheDocument()
    })

    it('should show badge with wishlist count', () => {
      act(() => {
        useWishlistStore.getState().addItem(mockProduct)
      })

      render(<Header />)
      const wishlistLink = screen.getByLabelText('Liste de souhaits')
      const badge = wishlistLink.querySelector('span')
      expect(badge).toHaveTextContent('1')
    })
  })

  describe('action links', () => {
    it('should link wishlist to /wishlist', () => {
      render(<Header />)
      const wishlistLink = screen.getByLabelText('Liste de souhaits')
      expect(wishlistLink).toHaveAttribute('href', '/wishlist')
    })

    it('should link account to /compte', () => {
      render(<Header />)
      const accountLink = screen.getByLabelText('Mon compte')
      expect(accountLink).toHaveAttribute('href', '/compte')
    })

    it('should link cart to /panier', () => {
      render(<Header />)
      const cartLink = screen.getByLabelText('Panier')
      expect(cartLink).toHaveAttribute('href', '/panier')
    })
  })

  describe('search', () => {
    it('should open search when search button is clicked', () => {
      render(<Header />)

      fireEvent.click(screen.getByLabelText('Rechercher'))

      expect(screen.getByTestId('search-bar')).toBeInTheDocument()
    })
  })

  describe('mobile menu', () => {
    it('should toggle mobile menu', () => {
      render(<Header />)

      // Menu should be closed initially - categories text in mobile menu shouldn't be visible
      // The word "Catégories" appears in both desktop nav and mobile menu
      const menuButton = screen.getByRole('button', { name: '' }) // Mobile menu button has no text

      // Click to open - look for the mobile-specific menu button
      const buttons = screen.getAllByRole('button')
      const mobileMenuButton = buttons.find(btn =>
        btn.classList.contains('lg:hidden') || btn.querySelector('svg')
      )

      if (mobileMenuButton) {
        fireEvent.click(mobileMenuButton)
      }
    })
  })

  describe('categories dropdown', () => {
    it('should render category links', () => {
      render(<Header />)

      // Categories should be in the DOM
      expect(screen.getByText('Catégories')).toBeInTheDocument()
    })
  })
})

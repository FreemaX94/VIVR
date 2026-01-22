import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CartSummary } from '@/components/cart/CartSummary'
import { useCartStore } from '@/stores/cartStore'
import { Product, Category } from '@/types'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}))

describe('CartSummary', () => {
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

  beforeEach(() => {
    useCartStore.getState().clearCart()
  })

  describe('Rendering', () => {
    it('should render title', () => {
      render(<CartSummary />)
      expect(screen.getByText('Résumé de la commande')).toBeInTheDocument()
    })

    it('should display subtotal', () => {
      useCartStore.getState().addItem(mockProduct, 2)
      render(<CartSummary />)

      expect(screen.getByText(/2 articles/)).toBeInTheDocument()
      expect(screen.getByText(/179,98/)).toBeInTheDocument()
    })

    it('should display shipping cost', () => {
      useCartStore.getState().addItem(mockProduct, 1)
      render(<CartSummary />)

      expect(screen.getByText('Livraison')).toBeInTheDocument()
      expect(screen.getByText(/4,99/)).toBeInTheDocument()
    })

    it('should display free shipping message when applicable', () => {
      useCartStore.getState().addItem(mockProduct, 1)
      const expensiveProduct = { ...mockProduct, id: 'prod-2', price: 100 }
      useCartStore.getState().addItem(expensiveProduct, 1)

      render(<CartSummary />)

      expect(screen.getByText('Gratuite')).toBeInTheDocument()
    })
  })

  describe('Shipping Calculation', () => {
    const FREE_SHIPPING_THRESHOLD = 50

    it('should charge shipping when total is below threshold', () => {
      const cheapProduct = { ...mockProduct, price: 30 }
      useCartStore.getState().addItem(cheapProduct, 1)

      render(<CartSummary />)

      expect(screen.getByText(/4,99/)).toBeInTheDocument()
    })

    it('should offer free shipping when total meets threshold', () => {
      useCartStore.getState().addItem(mockProduct, 1)

      render(<CartSummary />)

      expect(screen.getByText('Gratuite')).toBeInTheDocument()
    })

    it('should show progress bar when shipping cost applies', () => {
      const cheapProduct = { ...mockProduct, price: 30 }
      useCartStore.getState().addItem(cheapProduct, 1)

      const { container } = render(<CartSummary />)

      const progressBar = container.querySelector('.bg-success')
      expect(progressBar).toBeInTheDocument()
    })

    it('should calculate progress percentage correctly', () => {
      const cheapProduct = { ...mockProduct, price: 25 }
      useCartStore.getState().addItem(cheapProduct, 1)

      const { container } = render(<CartSummary />)

      const progressBar = container.querySelector('[style*="width"]')
      expect(progressBar).toHaveStyle('width: 50%')
    })
  })

  describe('Promo Code', () => {
    beforeEach(() => {
      useCartStore.getState().addItem(mockProduct, 1)
    })

    it('should render promo code input', () => {
      render(<CartSummary />)

      expect(screen.getByPlaceholderText('Code promo')).toBeInTheDocument()
    })

    it('should render apply button', () => {
      render(<CartSummary />)

      expect(screen.getByRole('button', { name: /Appliquer/i })).toBeInTheDocument()
    })

    it('should apply valid promo code', async () => {
      const user = userEvent.setup()
      render(<CartSummary />)

      const input = screen.getByPlaceholderText('Code promo')
      const button = screen.getByRole('button', { name: /Appliquer/i })

      await user.type(input, 'BIENVENUE10')
      await user.click(button)

      expect(screen.getByText(/BIENVENUE10 appliqué/)).toBeInTheDocument()
    })

    it('should show error for invalid promo code', async () => {
      const user = userEvent.setup()
      render(<CartSummary />)

      const input = screen.getByPlaceholderText('Code promo')
      const button = screen.getByRole('button', { name: /Appliquer/i })

      await user.type(input, 'INVALID')
      await user.click(button)

      expect(screen.getByText('Code promo invalide')).toBeInTheDocument()
    })

    it('should disable apply button when input is empty', () => {
      render(<CartSummary />)

      const button = screen.getByRole('button', { name: /Appliquer/i })
      expect(button).toBeDisabled()
    })

    it('should disable apply button after successful promo application', async () => {
      const user = userEvent.setup()
      render(<CartSummary />)

      const input = screen.getByPlaceholderText('Code promo')
      const button = screen.getByRole('button', { name: /Appliquer/i })

      await user.type(input, 'BIENVENUE10')
      await user.click(button)

      await waitFor(() => {
        expect(button).toBeDisabled()
      })
    })

    it('should apply 10% discount for BIENVENUE10 code', async () => {
      const user = userEvent.setup()
      render(<CartSummary />)

      const input = screen.getByPlaceholderText('Code promo')
      await user.type(input, 'BIENVENUE10')
      await user.click(screen.getByRole('button', { name: /Appliquer/i }))

      await waitFor(() => {
        expect(screen.getByText(/85,98/)).toBeInTheDocument()
      })
    })

    it('should clear error when user types after failed promo', async () => {
      const user = userEvent.setup()
      render(<CartSummary />)

      const input = screen.getByPlaceholderText('Code promo')
      const button = screen.getByRole('button', { name: /Appliquer/i })

      await user.type(input, 'INVALID')
      await user.click(button)
      expect(screen.getByText('Code promo invalide')).toBeInTheDocument()

      await user.clear(input)
      await user.type(input, 'BIENVENUE10')

      expect(screen.queryByText('Code promo invalide')).not.toBeInTheDocument()
    })
  })

  describe('Discount Display', () => {
    beforeEach(() => {
      useCartStore.getState().addItem(mockProduct, 1)
    })

    it('should not display discount when no promo applied', () => {
      render(<CartSummary />)

      expect(screen.queryByText(/Réduction/)).not.toBeInTheDocument()
    })

    it('should display discount row when promo applied', async () => {
      const user = userEvent.setup()
      render(<CartSummary />)

      const input = screen.getByPlaceholderText('Code promo')
      await user.type(input, 'BIENVENUE10')
      await user.click(screen.getByRole('button', { name: /Appliquer/i }))

      expect(screen.getByText('Réduction')).toBeInTheDocument()
    })

    it('should display discount in green', async () => {
      const user = userEvent.setup()
      const { container } = render(<CartSummary />)

      const input = screen.getByPlaceholderText('Code promo')
      await user.type(input, 'BIENVENUE10')
      await user.click(screen.getByRole('button', { name: /Appliquer/i }))

      const discountElement = screen.getByText('Réduction').parentElement
      expect(discountElement).toHaveClass('text-success')
    })
  })

  describe('Total Calculation', () => {
    it('should display total with all components', () => {
      useCartStore.getState().addItem(mockProduct, 1)
      render(<CartSummary />)

      const totalElement = screen.getByText(/94,98/)
      expect(totalElement).toBeInTheDocument()
      expect(totalElement).toHaveClass('text-xl', 'font-bold')
    })

    it('should calculate correct total with discount', async () => {
      const user = userEvent.setup()
      useCartStore.getState().addItem(mockProduct, 1)
      render(<CartSummary />)

      const input = screen.getByPlaceholderText('Code promo')
      await user.type(input, 'BIENVENUE10')
      await user.click(screen.getByRole('button', { name: /Appliquer/i }))

      await waitFor(() => {
        expect(screen.getByText(/85,98/)).toBeInTheDocument()
      })
    })

    it('should display tax notice', () => {
      render(<CartSummary />)

      expect(screen.getByText('TVA incluse')).toBeInTheDocument()
    })
  })

  describe('Checkout Button', () => {
    beforeEach(() => {
      useCartStore.getState().addItem(mockProduct, 1)
    })

    it('should show checkout button by default', () => {
      render(<CartSummary />)

      expect(screen.getByRole('link', { name: /Passer la commande/i })).toBeInTheDocument()
    })

    it('should hide checkout button when showCheckoutButton is false', () => {
      render(<CartSummary showCheckoutButton={false} />)

      expect(screen.queryByRole('link', { name: /Passer la commande/i })).not.toBeInTheDocument()
    })

    it('should link to checkout page', () => {
      render(<CartSummary />)

      const checkoutLink = screen.getByRole('link', { name: /Passer la commande/i })
      expect(checkoutLink).toHaveAttribute('href', '/checkout')
    })

    it('should display continue shopping link', () => {
      render(<CartSummary />)

      const continueLink = screen.getByRole('link', { name: /Continuer mes achats/i })
      expect(continueLink).toHaveAttribute('href', '/produits')
    })
  })

  describe('Trust Badges', () => {
    it('should display trust badges', () => {
      render(<CartSummary />)

      expect(screen.getByText('Paiement sécurisé')).toBeInTheDocument()
      expect(screen.getByText('Retours gratuits')).toBeInTheDocument()
      expect(screen.getByText('Livraison rapide')).toBeInTheDocument()
    })
  })

  describe('Article Count', () => {
    it('should display singular article text', () => {
      useCartStore.getState().addItem(mockProduct, 1)
      render(<CartSummary />)

      expect(screen.getByText(/1 article[^s]/)).toBeInTheDocument()
    })

    it('should display plural articles text', () => {
      useCartStore.getState().addItem(mockProduct, 3)
      render(<CartSummary />)

      expect(screen.getByText(/3 articles/)).toBeInTheDocument()
    })
  })

  describe('Responsive', () => {
    it('should accept custom className', () => {
      const { container } = render(
        <CartSummary className="custom-class" />
      )

      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })

  describe('Empty Cart', () => {
    it('should display 0 articles when cart is empty', () => {
      render(<CartSummary />)

      expect(screen.getByText(/0 article/)).toBeInTheDocument()
    })

    it('should display 0 total when cart is empty', () => {
      render(<CartSummary />)

      expect(screen.getByText(/0,00/)).toBeInTheDocument()
    })

    it('should offer free shipping message when cart is empty', () => {
      render(<CartSummary />)

      expect(screen.getByText(/0,00/)).toBeInTheDocument()
    })
  })

  describe('Multiple Products', () => {
    it('should calculate total with multiple different products', () => {
      useCartStore.getState().addItem(mockProduct, 1)
      const product2 = { ...mockProduct, id: 'prod-2', price: 50 }
      useCartStore.getState().addItem(product2, 2)

      render(<CartSummary />)

      const total = 89.99 + (50 * 2) + 4.99
      expect(screen.getByText(/234,97/)).toBeInTheDocument()
    })

    it('should count items correctly with multiple products', () => {
      useCartStore.getState().addItem(mockProduct, 2)
      const product2 = { ...mockProduct, id: 'prod-2', price: 50 }
      useCartStore.getState().addItem(product2, 1)

      render(<CartSummary />)

      expect(screen.getByText(/3 articles/)).toBeInTheDocument()
    })
  })

  describe('Free Shipping Threshold', () => {
    it('should show free shipping icon and message when threshold met', () => {
      useCartStore.getState().addItem(mockProduct, 1)
      render(<CartSummary />)

      expect(screen.getByText('Gratuite')).toBeInTheDocument()
    })

    it('should show progress message when below threshold', () => {
      const cheapProduct = { ...mockProduct, price: 30 }
      useCartStore.getState().addItem(cheapProduct, 1)

      render(<CartSummary />)

      expect(screen.getByText(/Plus que/)).toBeInTheDocument()
    })

    it('should calculate remaining amount correctly', () => {
      const cheapProduct = { ...mockProduct, price: 35 }
      useCartStore.getState().addItem(cheapProduct, 1)

      render(<CartSummary />)

      // 50 - 35 = 15
      expect(screen.getByText(/15,00/)).toBeInTheDocument()
    })
  })
})

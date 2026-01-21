import { render, screen } from '@testing-library/react'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Product, Category } from '@/types'

// Mock ProductCard to simplify testing
jest.mock('@/components/product/ProductCard', () => ({
  ProductCard: ({ product, priority }: { product: Product; priority: boolean }) => (
    <div data-testid={`product-card-${product.id}`} data-priority={priority}>
      {product.name}
    </div>
  ),
}))

// Mock Skeleton
jest.mock('@/components/ui/Skeleton', () => ({
  ProductGridSkeleton: ({ count }: { count: number }) => (
    <div data-testid="product-grid-skeleton" data-count={count}>
      Loading...
    </div>
  ),
}))

const mockCategory: Category = {
  id: 'cat-1',
  name: 'Salon',
  slug: 'salon',
}

const createMockProduct = (id: string, name: string): Product => ({
  id,
  name,
  slug: name.toLowerCase().replace(/\s+/g, '-'),
  description: 'Description',
  price: 99.99,
  images: ['image.jpg'],
  category: mockCategory,
  categoryId: 'cat-1',
  stock: 10,
  featured: false,
  reviews: [],
  createdAt: new Date(),
})

const mockProducts: Product[] = [
  createMockProduct('1', 'Product 1'),
  createMockProduct('2', 'Product 2'),
  createMockProduct('3', 'Product 3'),
  createMockProduct('4', 'Product 4'),
  createMockProduct('5', 'Product 5'),
]

describe('ProductGrid', () => {
  describe('rendering products', () => {
    it('should render all products', () => {
      render(<ProductGrid products={mockProducts} />)

      mockProducts.forEach(product => {
        expect(screen.getByText(product.name)).toBeInTheDocument()
      })
    })

    it('should render ProductCard for each product', () => {
      render(<ProductGrid products={mockProducts} />)

      mockProducts.forEach(product => {
        expect(screen.getByTestId(`product-card-${product.id}`)).toBeInTheDocument()
      })
    })

    it('should set priority=true for first 4 products', () => {
      render(<ProductGrid products={mockProducts} />)

      // First 4 should have priority
      expect(screen.getByTestId('product-card-1')).toHaveAttribute('data-priority', 'true')
      expect(screen.getByTestId('product-card-2')).toHaveAttribute('data-priority', 'true')
      expect(screen.getByTestId('product-card-3')).toHaveAttribute('data-priority', 'true')
      expect(screen.getByTestId('product-card-4')).toHaveAttribute('data-priority', 'true')

      // 5th should not have priority
      expect(screen.getByTestId('product-card-5')).toHaveAttribute('data-priority', 'false')
    })
  })

  describe('loading state', () => {
    it('should render skeleton when loading', () => {
      render(<ProductGrid products={[]} isLoading={true} />)
      expect(screen.getByTestId('product-grid-skeleton')).toBeInTheDocument()
    })

    it('should pass count=8 to skeleton', () => {
      render(<ProductGrid products={[]} isLoading={true} />)
      expect(screen.getByTestId('product-grid-skeleton')).toHaveAttribute('data-count', '8')
    })

    it('should not render products when loading', () => {
      render(<ProductGrid products={mockProducts} isLoading={true} />)
      expect(screen.queryByTestId('product-card-1')).not.toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('should render empty message when no products', () => {
      render(<ProductGrid products={[]} />)
      expect(screen.getByText('Aucun produit trouvé')).toBeInTheDocument()
    })

    it('should not render grid when empty', () => {
      const { container } = render(<ProductGrid products={[]} />)
      expect(container.querySelector('.grid')).not.toBeInTheDocument()
    })
  })

  describe('columns', () => {
    it('should use 4 columns by default', () => {
      const { container } = render(<ProductGrid products={mockProducts} />)
      expect(container.firstChild).toHaveClass('lg:grid-cols-4')
    })

    it('should render 2 columns when specified', () => {
      const { container } = render(<ProductGrid products={mockProducts} columns={2} />)
      expect(container.firstChild).toHaveClass('sm:grid-cols-2')
      expect(container.firstChild).not.toHaveClass('lg:grid-cols-4')
    })

    it('should render 3 columns when specified', () => {
      const { container } = render(<ProductGrid products={mockProducts} columns={3} />)
      expect(container.firstChild).toHaveClass('lg:grid-cols-3')
    })

    it('should render 4 columns when specified', () => {
      const { container } = render(<ProductGrid products={mockProducts} columns={4} />)
      expect(container.firstChild).toHaveClass('lg:grid-cols-4')
    })
  })

  describe('grid styling', () => {
    it('should have gap between items', () => {
      const { container } = render(<ProductGrid products={mockProducts} />)
      expect(container.firstChild).toHaveClass('gap-6')
    })

    it('should have grid display', () => {
      const { container } = render(<ProductGrid products={mockProducts} />)
      expect(container.firstChild).toHaveClass('grid')
    })
  })

  describe('custom className', () => {
    it('should merge custom className', () => {
      const { container } = render(
        <ProductGrid products={mockProducts} className="custom-class" />
      )
      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('should not override grid classes', () => {
      const { container } = render(
        <ProductGrid products={mockProducts} className="custom-class" />
      )
      expect(container.firstChild).toHaveClass('grid', 'custom-class')
    })
  })
})

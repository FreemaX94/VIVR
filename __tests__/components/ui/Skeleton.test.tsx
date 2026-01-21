import { render } from '@testing-library/react'
import {
  Skeleton,
  ProductCardSkeleton,
  ProductGridSkeleton,
  CartItemSkeleton,
} from '@/components/ui/Skeleton'

describe('Skeleton', () => {
  describe('rendering', () => {
    it('should render skeleton element', () => {
      const { container } = render(<Skeleton />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should have animation class', () => {
      const { container } = render(<Skeleton />)
      expect(container.firstChild).toHaveClass('animate-pulse')
    })

    it('should have rounded class', () => {
      const { container } = render(<Skeleton />)
      expect(container.firstChild).toHaveClass('rounded')
    })
  })

  describe('custom className', () => {
    it('should merge custom className', () => {
      const { container } = render(<Skeleton className="h-10 w-full" />)
      expect(container.firstChild).toHaveClass('h-10', 'w-full')
    })

    it('should apply custom dimensions', () => {
      const { container } = render(<Skeleton className="h-4 w-3/4" />)
      expect(container.firstChild).toHaveClass('h-4', 'w-3/4')
    })
  })
})

describe('ProductCardSkeleton', () => {
  it('should render product card skeleton', () => {
    const { container } = render(<ProductCardSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should have card styling', () => {
    const { container } = render(<ProductCardSkeleton />)
    expect(container.firstChild).toHaveClass('rounded-xl', 'overflow-hidden')
  })

  it('should contain multiple skeleton elements', () => {
    const { container } = render(<ProductCardSkeleton />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(1)
  })

  it('should have image skeleton with aspect-square', () => {
    const { container } = render(<ProductCardSkeleton />)
    const imageSkeleton = container.querySelector('.aspect-square')
    expect(imageSkeleton).toBeInTheDocument()
  })
})

describe('ProductGridSkeleton', () => {
  it('should render default 8 product skeletons', () => {
    const { container } = render(<ProductGridSkeleton />)
    const cards = container.querySelectorAll('.rounded-xl.overflow-hidden')
    expect(cards.length).toBe(8)
  })

  it('should render custom count of product skeletons', () => {
    const { container } = render(<ProductGridSkeleton count={4} />)
    const cards = container.querySelectorAll('.rounded-xl.overflow-hidden')
    expect(cards.length).toBe(4)
  })

  it('should render 12 product skeletons', () => {
    const { container } = render(<ProductGridSkeleton count={12} />)
    const cards = container.querySelectorAll('.rounded-xl.overflow-hidden')
    expect(cards.length).toBe(12)
  })

  it('should have grid layout', () => {
    const { container } = render(<ProductGridSkeleton />)
    expect(container.firstChild).toHaveClass('grid')
  })

  it('should have responsive columns', () => {
    const { container } = render(<ProductGridSkeleton />)
    expect(container.firstChild).toHaveClass(
      'grid-cols-2',
      'md:grid-cols-3',
      'lg:grid-cols-4'
    )
  })

  it('should have gap between items', () => {
    const { container } = render(<ProductGridSkeleton />)
    expect(container.firstChild).toHaveClass('gap-6')
  })
})

describe('CartItemSkeleton', () => {
  it('should render cart item skeleton', () => {
    const { container } = render(<CartItemSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should have flex layout', () => {
    const { container } = render(<CartItemSkeleton />)
    expect(container.firstChild).toHaveClass('flex', 'gap-4')
  })

  it('should have border bottom', () => {
    const { container } = render(<CartItemSkeleton />)
    expect(container.firstChild).toHaveClass('border-b')
  })

  it('should contain image skeleton', () => {
    const { container } = render(<CartItemSkeleton />)
    const imageSkeleton = container.querySelector('.w-24.h-24')
    expect(imageSkeleton).toBeInTheDocument()
  })

  it('should contain multiple skeleton elements', () => {
    const { container } = render(<CartItemSkeleton />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(3)
  })
})

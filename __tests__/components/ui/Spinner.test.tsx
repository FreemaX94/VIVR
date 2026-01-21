import { render, screen } from '@testing-library/react'
import { Spinner, LoadingOverlay } from '@/components/ui/Spinner'

describe('Spinner', () => {
  describe('rendering', () => {
    it('should render spinner element', () => {
      const { container } = render(<Spinner />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should have animation class', () => {
      const { container } = render(<Spinner />)
      expect(container.firstChild).toHaveClass('animate-spin')
    })

    it('should have rounded class', () => {
      const { container } = render(<Spinner />)
      expect(container.firstChild).toHaveClass('rounded-full')
    })
  })

  describe('sizes', () => {
    it('should render sm size', () => {
      const { container } = render(<Spinner size="sm" />)
      expect(container.firstChild).toHaveClass('h-4', 'w-4', 'border-2')
    })

    it('should render md size by default', () => {
      const { container } = render(<Spinner />)
      expect(container.firstChild).toHaveClass('h-6', 'w-6', 'border-2')
    })

    it('should render lg size', () => {
      const { container } = render(<Spinner size="lg" />)
      expect(container.firstChild).toHaveClass('h-8', 'w-8', 'border-3')
    })
  })

  describe('custom className', () => {
    it('should merge custom className', () => {
      const { container } = render(<Spinner className="custom-class" />)
      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('should not override base classes', () => {
      const { container } = render(<Spinner className="custom-class" />)
      expect(container.firstChild).toHaveClass('animate-spin', 'custom-class')
    })
  })
})

describe('LoadingOverlay', () => {
  describe('rendering', () => {
    it('should render overlay', () => {
      const { container } = render(<LoadingOverlay />)
      expect(container.firstChild).toHaveClass('fixed', 'inset-0')
    })

    it('should render spinner', () => {
      const { container } = render(<LoadingOverlay />)
      expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    })

    it('should render message when provided', () => {
      render(<LoadingOverlay message="Loading..." />)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should not render message when not provided', () => {
      const { container } = render(<LoadingOverlay />)
      const text = container.querySelector('p')
      expect(text).not.toBeInTheDocument()
    })
  })

  describe('styling', () => {
    it('should have backdrop blur', () => {
      const { container } = render(<LoadingOverlay />)
      expect(container.firstChild).toHaveClass('backdrop-blur-sm')
    })

    it('should have high z-index', () => {
      const { container } = render(<LoadingOverlay />)
      expect(container.firstChild).toHaveClass('z-50')
    })

    it('should be centered', () => {
      const { container } = render(<LoadingOverlay />)
      expect(container.firstChild).toHaveClass('flex', 'items-center', 'justify-center')
    })
  })

  describe('spinner size', () => {
    it('should use large spinner', () => {
      const { container } = render(<LoadingOverlay />)
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toHaveClass('h-8', 'w-8')
    })
  })
})

import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/Badge'

describe('Badge', () => {
  describe('rendering', () => {
    it('should render badge with text', () => {
      render(<Badge>New</Badge>)
      expect(screen.getByText('New')).toBeInTheDocument()
    })

    it('should render with default variant and size', () => {
      render(<Badge>Default</Badge>)
      const badge = screen.getByText('Default')
      expect(badge).toHaveClass('bg-bg-secondary')
      expect(badge).toHaveClass('text-xs')
    })
  })

  describe('variants', () => {
    it('should render default variant', () => {
      render(<Badge variant="default">Default</Badge>)
      expect(screen.getByText('Default')).toHaveClass('bg-bg-secondary', 'text-text-primary')
    })

    it('should render primary variant', () => {
      render(<Badge variant="primary">Primary</Badge>)
      expect(screen.getByText('Primary')).toHaveClass('bg-black', 'text-white')
    })

    it('should render secondary variant', () => {
      render(<Badge variant="secondary">Secondary</Badge>)
      expect(screen.getByText('Secondary')).toHaveClass('bg-white', 'border')
    })

    it('should render success variant', () => {
      render(<Badge variant="success">Success</Badge>)
      expect(screen.getByText('Success')).toHaveClass('text-success')
    })

    it('should render warning variant', () => {
      render(<Badge variant="warning">Warning</Badge>)
      expect(screen.getByText('Warning')).toHaveClass('text-warning')
    })

    it('should render error variant', () => {
      render(<Badge variant="error">Error</Badge>)
      expect(screen.getByText('Error')).toHaveClass('text-error')
    })

    it('should render outline variant', () => {
      render(<Badge variant="outline">Outline</Badge>)
      expect(screen.getByText('Outline')).toHaveClass('bg-transparent', 'border')
    })
  })

  describe('sizes', () => {
    it('should render sm size', () => {
      render(<Badge size="sm">Small</Badge>)
      const badge = screen.getByText('Small')
      expect(badge).toHaveClass('text-xs', 'px-2', 'py-0.5')
    })

    it('should render md size', () => {
      render(<Badge size="md">Medium</Badge>)
      const badge = screen.getByText('Medium')
      expect(badge).toHaveClass('text-xs', 'px-2.5', 'py-1')
    })

    it('should render lg size', () => {
      render(<Badge size="lg">Large</Badge>)
      const badge = screen.getByText('Large')
      expect(badge).toHaveClass('text-sm', 'px-3', 'py-1.5')
    })
  })

  describe('custom className', () => {
    it('should merge custom className', () => {
      render(<Badge className="custom-class">Custom</Badge>)
      expect(screen.getByText('Custom')).toHaveClass('custom-class')
    })

    it('should not override base styles', () => {
      render(<Badge className="custom-class" variant="success">Custom</Badge>)
      const badge = screen.getByText('Custom')
      expect(badge).toHaveClass('custom-class')
      expect(badge).toHaveClass('text-success')
    })
  })

  describe('forwardRef', () => {
    it('should forward ref to span element', () => {
      const ref = { current: null }
      render(<Badge ref={ref}>Ref Badge</Badge>)
      expect(ref.current).toBeInstanceOf(HTMLSpanElement)
    })
  })

  describe('HTML attributes', () => {
    it('should pass data attributes', () => {
      render(<Badge data-testid="test-badge">Test</Badge>)
      expect(screen.getByTestId('test-badge')).toBeInTheDocument()
    })

    it('should pass id attribute', () => {
      render(<Badge id="my-badge">ID Badge</Badge>)
      expect(screen.getByText('ID Badge')).toHaveAttribute('id', 'my-badge')
    })
  })

  describe('accessibility', () => {
    it('should be accessible as text element', () => {
      render(<Badge>Accessible</Badge>)
      expect(screen.getByText('Accessible').tagName).toBe('SPAN')
    })
  })
})

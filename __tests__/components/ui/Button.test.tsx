import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'
import { Heart } from 'lucide-react'

describe('Button', () => {
  describe('rendering', () => {
    it('should render button with text', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
    })

    it('should render with default variant and size', () => {
      render(<Button>Default</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-glossy-button')
      expect(button).toHaveClass('h-11')
    })
  })

  describe('variants', () => {
    it('should render primary variant', () => {
      render(<Button variant="primary">Primary</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-glossy-button')
    })

    it('should render secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-white')
    })

    it('should render outline variant', () => {
      render(<Button variant="outline">Outline</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-transparent')
    })

    it('should render ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-transparent')
    })

    it('should render danger variant', () => {
      render(<Button variant="danger">Danger</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-error')
    })

    it('should render success variant', () => {
      render(<Button variant="success">Success</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-success')
    })
  })

  describe('sizes', () => {
    it('should render sm size', () => {
      render(<Button size="sm">Small</Button>)
      expect(screen.getByRole('button')).toHaveClass('h-9')
    })

    it('should render md size', () => {
      render(<Button size="md">Medium</Button>)
      expect(screen.getByRole('button')).toHaveClass('h-11')
    })

    it('should render lg size', () => {
      render(<Button size="lg">Large</Button>)
      expect(screen.getByRole('button')).toHaveClass('h-12')
    })

    it('should render xl size', () => {
      render(<Button size="xl">Extra Large</Button>)
      expect(screen.getByRole('button')).toHaveClass('h-14')
    })

    it('should render icon size', () => {
      render(<Button size="icon"><Heart /></Button>)
      expect(screen.getByRole('button')).toHaveClass('h-10', 'w-10')
    })
  })

  describe('fullWidth', () => {
    it('should render full width when fullWidth is true', () => {
      render(<Button fullWidth>Full Width</Button>)
      expect(screen.getByRole('button')).toHaveClass('w-full')
    })

    it('should not have w-full when fullWidth is false', () => {
      render(<Button fullWidth={false}>Not Full</Button>)
      expect(screen.getByRole('button')).not.toHaveClass('w-full')
    })
  })

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should not trigger onClick when disabled', () => {
      const onClick = jest.fn()
      render(<Button disabled onClick={onClick}>Disabled</Button>)
      fireEvent.click(screen.getByRole('button'))
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('loading state', () => {
    it('should be disabled when isLoading is true', () => {
      render(<Button isLoading>Loading</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should show loading spinner when isLoading', () => {
      render(<Button isLoading>Loading</Button>)
      expect(screen.getByRole('button').querySelector('.animate-spin')).toBeInTheDocument()
    })

    it('should not show left icon when loading', () => {
      render(
        <Button isLoading leftIcon={<span data-testid="left-icon" />}>
          Loading
        </Button>
      )
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument()
    })

    it('should not show right icon when loading', () => {
      render(
        <Button isLoading rightIcon={<span data-testid="right-icon" />}>
          Loading
        </Button>
      )
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument()
    })
  })

  describe('icons', () => {
    it('should render left icon', () => {
      render(
        <Button leftIcon={<span data-testid="left-icon" />}>
          With Icon
        </Button>
      )
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    })

    it('should render right icon', () => {
      render(
        <Button rightIcon={<span data-testid="right-icon" />}>
          With Icon
        </Button>
      )
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })

    it('should render both icons', () => {
      render(
        <Button
          leftIcon={<span data-testid="left-icon" />}
          rightIcon={<span data-testid="right-icon" />}
        >
          Both Icons
        </Button>
      )
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('should call onClick when clicked', () => {
      const onClick = jest.fn()
      render(<Button onClick={onClick}>Click</Button>)
      fireEvent.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when loading', () => {
      const onClick = jest.fn()
      render(<Button isLoading onClick={onClick}>Click</Button>)
      fireEvent.click(screen.getByRole('button'))
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('custom className', () => {
    it('should merge custom className', () => {
      render(<Button className="custom-class">Custom</Button>)
      expect(screen.getByRole('button')).toHaveClass('custom-class')
    })
  })

  describe('forwardRef', () => {
    it('should forward ref to button element', () => {
      const ref = { current: null }
      render(<Button ref={ref}>Ref Button</Button>)
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })
  })

  describe('HTML attributes', () => {
    it('should pass type attribute', () => {
      render(<Button type="submit">Submit</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
    })

    it('should pass aria-label', () => {
      render(<Button aria-label="Close dialog">X</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Close dialog')
    })
  })
})

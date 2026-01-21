import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardImage,
} from '@/components/ui/Card'

describe('Card', () => {
  describe('rendering', () => {
    it('should render card with children', () => {
      render(<Card>Card content</Card>)
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('should have rounded corners', () => {
      const { container } = render(<Card>Content</Card>)
      expect(container.firstChild).toHaveClass('rounded-xl')
    })

    it('should have overflow hidden', () => {
      const { container } = render(<Card>Content</Card>)
      expect(container.firstChild).toHaveClass('overflow-hidden')
    })
  })

  describe('glossy prop', () => {
    it('should have glossy styles by default', () => {
      const { container } = render(<Card>Content</Card>)
      expect(container.firstChild).toHaveClass('bg-gradient-to-br', 'shadow-card')
    })

    it('should not have glossy styles when glossy is false', () => {
      const { container } = render(<Card glossy={false}>Content</Card>)
      expect(container.firstChild).not.toHaveClass('bg-gradient-to-br')
      expect(container.firstChild).not.toHaveClass('shadow-card')
    })
  })

  describe('hover prop', () => {
    it('should have hover styles by default', () => {
      const { container } = render(<Card>Content</Card>)
      expect(container.firstChild).toHaveClass(
        'transition-all',
        'hover:shadow-card-hover',
        'hover:-translate-y-1'
      )
    })

    it('should not have hover styles when hover is false', () => {
      const { container } = render(<Card hover={false}>Content</Card>)
      expect(container.firstChild).not.toHaveClass('hover:shadow-card-hover')
      expect(container.firstChild).not.toHaveClass('hover:-translate-y-1')
    })
  })

  describe('custom className', () => {
    it('should merge custom className', () => {
      const { container } = render(<Card className="custom-class">Content</Card>)
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('forwardRef', () => {
    it('should forward ref to div element', () => {
      const ref = { current: null }
      render(<Card ref={ref}>Content</Card>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })
})

describe('CardHeader', () => {
  it('should render children', () => {
    render(<CardHeader>Header content</CardHeader>)
    expect(screen.getByText('Header content')).toBeInTheDocument()
  })

  it('should have default padding', () => {
    const { container } = render(<CardHeader>Header</CardHeader>)
    expect(container.firstChild).toHaveClass('px-6', 'py-4')
  })

  it('should merge custom className', () => {
    const { container } = render(
      <CardHeader className="custom-class">Header</CardHeader>
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should forward ref', () => {
    const ref = { current: null }
    render(<CardHeader ref={ref}>Header</CardHeader>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})

describe('CardTitle', () => {
  it('should render as h3 element', () => {
    render(<CardTitle>Title</CardTitle>)
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
  })

  it('should have title styles', () => {
    const { container } = render(<CardTitle>Title</CardTitle>)
    expect(container.firstChild).toHaveClass(
      'text-lg',
      'font-semibold',
      'text-text-primary'
    )
  })

  it('should merge custom className', () => {
    const { container } = render(<CardTitle className="custom-class">Title</CardTitle>)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should forward ref', () => {
    const ref = { current: null }
    render(<CardTitle ref={ref}>Title</CardTitle>)
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement)
  })
})

describe('CardDescription', () => {
  it('should render as p element', () => {
    render(<CardDescription>Description</CardDescription>)
    expect(screen.getByText('Description').tagName).toBe('P')
  })

  it('should have description styles', () => {
    const { container } = render(<CardDescription>Description</CardDescription>)
    expect(container.firstChild).toHaveClass(
      'text-sm',
      'text-text-secondary',
      'mt-1'
    )
  })

  it('should merge custom className', () => {
    const { container } = render(
      <CardDescription className="custom-class">Description</CardDescription>
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should forward ref', () => {
    const ref = { current: null }
    render(<CardDescription ref={ref}>Description</CardDescription>)
    expect(ref.current).toBeInstanceOf(HTMLParagraphElement)
  })
})

describe('CardContent', () => {
  it('should render children', () => {
    render(<CardContent>Content</CardContent>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should have default padding', () => {
    const { container } = render(<CardContent>Content</CardContent>)
    expect(container.firstChild).toHaveClass('px-6', 'py-4')
  })

  it('should merge custom className', () => {
    const { container } = render(
      <CardContent className="custom-class">Content</CardContent>
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should forward ref', () => {
    const ref = { current: null }
    render(<CardContent ref={ref}>Content</CardContent>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})

describe('CardFooter', () => {
  it('should render children', () => {
    render(<CardFooter>Footer</CardFooter>)
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('should have default styles', () => {
    const { container } = render(<CardFooter>Footer</CardFooter>)
    expect(container.firstChild).toHaveClass('px-6', 'py-4', 'bg-bg-secondary/50')
  })

  it('should merge custom className', () => {
    const { container } = render(
      <CardFooter className="custom-class">Footer</CardFooter>
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should forward ref', () => {
    const ref = { current: null }
    render(<CardFooter ref={ref}>Footer</CardFooter>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})

describe('CardImage', () => {
  it('should render children', () => {
    render(<CardImage><img alt="test" src="/test.jpg" /></CardImage>)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('should have default aspect ratio', () => {
    const { container } = render(<CardImage>Image</CardImage>)
    expect(container.firstChild).toHaveClass('aspect-[4/3]')
  })

  it('should accept custom aspect ratio', () => {
    const { container } = render(
      <CardImage aspectRatio="aspect-square">Image</CardImage>
    )
    expect(container.firstChild).toHaveClass('aspect-square')
  })

  it('should have relative positioning', () => {
    const { container } = render(<CardImage>Image</CardImage>)
    expect(container.firstChild).toHaveClass('relative')
  })

  it('should have overflow hidden', () => {
    const { container } = render(<CardImage>Image</CardImage>)
    expect(container.firstChild).toHaveClass('overflow-hidden')
  })

  it('should merge custom className', () => {
    const { container } = render(
      <CardImage className="custom-class">Image</CardImage>
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should forward ref', () => {
    const ref = { current: null }
    render(<CardImage ref={ref}>Image</CardImage>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})

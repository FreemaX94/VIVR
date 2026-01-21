import { render, screen, fireEvent } from '@testing-library/react'
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal'

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    children: <div>Modal content</div>,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<Modal {...defaultProps} />)
      expect(screen.getByText('Modal content')).toBeInTheDocument()
    })

    it('should not render modal when isOpen is false', () => {
      render(<Modal {...defaultProps} isOpen={false} />)
      expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
    })

    it('should render title when provided', () => {
      render(<Modal {...defaultProps} title="Modal Title" />)
      expect(screen.getByText('Modal Title')).toBeInTheDocument()
    })

    it('should render description when provided', () => {
      render(<Modal {...defaultProps} title="Title" description="Modal description" />)
      expect(screen.getByText('Modal description')).toBeInTheDocument()
    })

    it('should render close button by default', () => {
      render(<Modal {...defaultProps} title="Title" />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should hide close button when showCloseButton is false', () => {
      render(<Modal {...defaultProps} showCloseButton={false} />)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('sizes', () => {
    it('should apply sm size class', () => {
      const { container } = render(<Modal {...defaultProps} size="sm" />)
      expect(container.querySelector('.max-w-md')).toBeInTheDocument()
    })

    it('should apply md size class by default', () => {
      const { container } = render(<Modal {...defaultProps} />)
      expect(container.querySelector('.max-w-lg')).toBeInTheDocument()
    })

    it('should apply lg size class', () => {
      const { container } = render(<Modal {...defaultProps} size="lg" />)
      expect(container.querySelector('.max-w-2xl')).toBeInTheDocument()
    })

    it('should apply xl size class', () => {
      const { container } = render(<Modal {...defaultProps} size="xl" />)
      expect(container.querySelector('.max-w-4xl')).toBeInTheDocument()
    })

    it('should apply full size class', () => {
      const { container } = render(<Modal {...defaultProps} size="full" />)
      expect(container.querySelector('.max-w-\\[90vw\\]')).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('should call onClose when close button is clicked', () => {
      const onClose = jest.fn()
      render(<Modal {...defaultProps} title="Title" onClose={onClose} />)

      fireEvent.click(screen.getByRole('button'))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when overlay is clicked', () => {
      const onClose = jest.fn()
      const { container } = render(<Modal {...defaultProps} onClose={onClose} />)

      const overlay = container.querySelector('.bg-black\\/50')
      if (overlay) {
        fireEvent.click(overlay)
      }
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should not call onClose when overlay click is disabled', () => {
      const onClose = jest.fn()
      const { container } = render(
        <Modal {...defaultProps} onClose={onClose} closeOnOverlayClick={false} />
      )

      const overlay = container.querySelector('.bg-black\\/50')
      if (overlay) {
        fireEvent.click(overlay)
      }
      expect(onClose).not.toHaveBeenCalled()
    })

    it('should not call onClose when modal content is clicked', () => {
      const onClose = jest.fn()
      render(<Modal {...defaultProps} onClose={onClose} />)

      fireEvent.click(screen.getByText('Modal content'))
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('header rendering', () => {
    it('should render header when title is provided', () => {
      const { container } = render(<Modal {...defaultProps} title="Test Title" />)
      expect(container.querySelector('.border-b')).toBeInTheDocument()
    })

    it('should render header when showCloseButton is true (default)', () => {
      const { container } = render(<Modal {...defaultProps} />)
      // Header should be rendered because showCloseButton defaults to true
      expect(container.querySelector('.border-b')).toBeInTheDocument()
    })

    it('should not render header when no title and showCloseButton is false', () => {
      const { container } = render(
        <Modal {...defaultProps} showCloseButton={false} />
      )
      expect(container.querySelector('.border-b')).not.toBeInTheDocument()
    })
  })
})

describe('ModalBody', () => {
  it('should render children', () => {
    render(<ModalBody>Body content</ModalBody>)
    expect(screen.getByText('Body content')).toBeInTheDocument()
  })

  it('should apply default padding', () => {
    const { container } = render(<ModalBody>Content</ModalBody>)
    expect(container.firstChild).toHaveClass('px-6', 'py-4')
  })

  it('should merge custom className', () => {
    const { container } = render(
      <ModalBody className="custom-class">Content</ModalBody>
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})

describe('ModalFooter', () => {
  it('should render children', () => {
    render(<ModalFooter>Footer content</ModalFooter>)
    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })

  it('should apply default styles', () => {
    const { container } = render(<ModalFooter>Content</ModalFooter>)
    expect(container.firstChild).toHaveClass('px-6', 'py-4', 'flex')
  })

  it('should merge custom className', () => {
    const { container } = render(
      <ModalFooter className="custom-class">Content</ModalFooter>
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})

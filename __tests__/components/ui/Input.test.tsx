import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input, Textarea } from '@/components/ui/Input'
import { Search, Eye } from 'lucide-react'

describe('Input', () => {
  describe('rendering', () => {
    it('should render input element', () => {
      render(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('should render with label', () => {
      render(<Input label="Email" />)
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
    })

    it('should generate id from label', () => {
      render(<Input label="Full Name" />)
      expect(screen.getByLabelText('Full Name')).toHaveAttribute('id', 'full-name')
    })

    it('should use provided id over generated one', () => {
      render(<Input label="Email" id="custom-email" />)
      expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'custom-email')
    })
  })

  describe('input types', () => {
    it('should default to text type', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')
    })

    it('should accept email type', () => {
      render(<Input type="email" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
    })

    it('should accept password type', () => {
      render(<Input type="password" placeholder="Password" />)
      expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password')
    })

    it('should accept number type', () => {
      render(<Input type="number" placeholder="Number" />)
      expect(screen.getByPlaceholderText('Number')).toHaveAttribute('type', 'number')
    })
  })

  describe('error state', () => {
    it('should display error message', () => {
      render(<Input error="This field is required" />)
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('should apply error styles', () => {
      render(<Input error="Error message" />)
      expect(screen.getByRole('textbox')).toHaveClass('border-error')
    })

    it('should hide hint when error is shown', () => {
      render(<Input error="Error" hint="This is a hint" />)
      expect(screen.queryByText('This is a hint')).not.toBeInTheDocument()
      expect(screen.getByText('Error')).toBeInTheDocument()
    })
  })

  describe('hint', () => {
    it('should display hint text', () => {
      render(<Input hint="Enter your email address" />)
      expect(screen.getByText('Enter your email address')).toBeInTheDocument()
    })

    it('should not display hint when error exists', () => {
      render(<Input hint="Hint text" error="Error text" />)
      expect(screen.queryByText('Hint text')).not.toBeInTheDocument()
    })
  })

  describe('icons', () => {
    it('should render left icon', () => {
      render(<Input leftIcon={<Search data-testid="left-icon" />} />)
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    })

    it('should render right icon', () => {
      render(<Input rightIcon={<Eye data-testid="right-icon" />} />)
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })

    it('should apply padding when left icon is present', () => {
      render(<Input leftIcon={<Search />} />)
      expect(screen.getByRole('textbox')).toHaveClass('pl-11')
    })

    it('should apply padding when right icon is present', () => {
      render(<Input rightIcon={<Eye />} />)
      expect(screen.getByRole('textbox')).toHaveClass('pr-11')
    })
  })

  describe('interactions', () => {
    it('should handle value changes', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<Input onChange={onChange} />)

      await user.type(screen.getByRole('textbox'), 'test')
      expect(onChange).toHaveBeenCalled()
    })

    it('should handle focus', () => {
      const onFocus = jest.fn()
      render(<Input onFocus={onFocus} />)
      fireEvent.focus(screen.getByRole('textbox'))
      expect(onFocus).toHaveBeenCalled()
    })

    it('should handle blur', () => {
      const onBlur = jest.fn()
      render(<Input onBlur={onBlur} />)
      fireEvent.blur(screen.getByRole('textbox'))
      expect(onBlur).toHaveBeenCalled()
    })
  })

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('should apply disabled styles', () => {
      render(<Input disabled />)
      expect(screen.getByRole('textbox')).toHaveClass('disabled:bg-bg-secondary')
    })
  })

  describe('forwardRef', () => {
    it('should forward ref to input element', () => {
      const ref = { current: null }
      render(<Input ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })
  })

  describe('custom className', () => {
    it('should merge custom className', () => {
      render(<Input className="custom-class" />)
      expect(screen.getByRole('textbox')).toHaveClass('custom-class')
    })
  })
})

describe('Textarea', () => {
  describe('rendering', () => {
    it('should render textarea element', () => {
      render(<Textarea placeholder="Enter message" />)
      expect(screen.getByPlaceholderText('Enter message')).toBeInTheDocument()
    })

    it('should render with label', () => {
      render(<Textarea label="Message" />)
      expect(screen.getByText('Message')).toBeInTheDocument()
      expect(screen.getByLabelText('Message')).toBeInTheDocument()
    })

    it('should accept rows prop', () => {
      render(<Textarea rows={5} />)
      expect(screen.getByRole('textbox')).toHaveAttribute('rows', '5')
    })
  })

  describe('error state', () => {
    it('should display error message', () => {
      render(<Textarea error="This field is required" />)
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('should apply error styles', () => {
      render(<Textarea error="Error" />)
      expect(screen.getByRole('textbox')).toHaveClass('border-error')
    })
  })

  describe('hint', () => {
    it('should display hint text', () => {
      render(<Textarea hint="Max 500 characters" />)
      expect(screen.getByText('Max 500 characters')).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('should handle value changes', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<Textarea onChange={onChange} />)

      await user.type(screen.getByRole('textbox'), 'test message')
      expect(onChange).toHaveBeenCalled()
    })
  })

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Textarea disabled />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })
  })

  describe('forwardRef', () => {
    it('should forward ref to textarea element', () => {
      const ref = { current: null }
      render(<Textarea ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
    })
  })

  describe('resize', () => {
    it('should have resize-none class', () => {
      render(<Textarea />)
      expect(screen.getByRole('textbox')).toHaveClass('resize-none')
    })
  })
})

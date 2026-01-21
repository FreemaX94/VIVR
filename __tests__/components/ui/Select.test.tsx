import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Select } from '@/components/ui/Select'

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
]

describe('Select', () => {
  describe('rendering', () => {
    it('should render select element', () => {
      render(<Select options={mockOptions} />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('should render all options', () => {
      render(<Select options={mockOptions} />)
      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByText('Option 2')).toBeInTheDocument()
      expect(screen.getByText('Option 3')).toBeInTheDocument()
    })

    it('should render with label', () => {
      render(<Select options={mockOptions} label="Category" />)
      expect(screen.getByText('Category')).toBeInTheDocument()
      expect(screen.getByLabelText('Category')).toBeInTheDocument()
    })

    it('should render placeholder', () => {
      render(<Select options={mockOptions} placeholder="Select an option" />)
      expect(screen.getByText('Select an option')).toBeInTheDocument()
    })

    it('should generate id from label', () => {
      render(<Select options={mockOptions} label="Product Category" />)
      expect(screen.getByLabelText('Product Category')).toHaveAttribute(
        'id',
        'product-category'
      )
    })

    it('should use provided id over generated one', () => {
      render(<Select options={mockOptions} label="Category" id="custom-id" />)
      expect(screen.getByLabelText('Category')).toHaveAttribute('id', 'custom-id')
    })
  })

  describe('options', () => {
    it('should render option values correctly', () => {
      render(<Select options={mockOptions} />)
      const options = screen.getAllByRole('option')
      expect(options[0]).toHaveValue('option1')
      expect(options[1]).toHaveValue('option2')
      expect(options[2]).toHaveValue('option3')
    })

    it('should render disabled options', () => {
      const optionsWithDisabled = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2', disabled: true },
      ]
      render(<Select options={optionsWithDisabled} />)
      expect(screen.getByText('Option 2').closest('option')).toBeDisabled()
    })

    it('should render placeholder as disabled option', () => {
      render(<Select options={mockOptions} placeholder="Choose..." />)
      expect(screen.getByText('Choose...').closest('option')).toBeDisabled()
    })
  })

  describe('error state', () => {
    it('should display error message', () => {
      render(<Select options={mockOptions} error="This field is required" />)
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('should apply error styles', () => {
      render(<Select options={mockOptions} error="Error" />)
      expect(screen.getByRole('combobox')).toHaveClass('border-error')
    })

    it('should hide hint when error is shown', () => {
      render(
        <Select options={mockOptions} error="Error" hint="Select a category" />
      )
      expect(screen.queryByText('Select a category')).not.toBeInTheDocument()
    })
  })

  describe('hint', () => {
    it('should display hint text', () => {
      render(<Select options={mockOptions} hint="Choose your preferred option" />)
      expect(screen.getByText('Choose your preferred option')).toBeInTheDocument()
    })

    it('should not display hint when error exists', () => {
      render(<Select options={mockOptions} hint="Hint" error="Error" />)
      expect(screen.queryByText('Hint')).not.toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('should handle value changes', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<Select options={mockOptions} onChange={onChange} />)

      await user.selectOptions(screen.getByRole('combobox'), 'option2')
      expect(onChange).toHaveBeenCalled()
    })

    it('should update selected value', async () => {
      const user = userEvent.setup()
      render(<Select options={mockOptions} />)

      await user.selectOptions(screen.getByRole('combobox'), 'option2')
      expect(screen.getByRole('combobox')).toHaveValue('option2')
    })
  })

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Select options={mockOptions} disabled />)
      expect(screen.getByRole('combobox')).toBeDisabled()
    })

    it('should apply disabled styles', () => {
      render(<Select options={mockOptions} disabled />)
      expect(screen.getByRole('combobox')).toHaveClass('disabled:bg-bg-secondary')
    })
  })

  describe('forwardRef', () => {
    it('should forward ref to select element', () => {
      const ref = { current: null }
      render(<Select options={mockOptions} ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLSelectElement)
    })
  })

  describe('custom className', () => {
    it('should merge custom className', () => {
      render(<Select options={mockOptions} className="custom-class" />)
      expect(screen.getByRole('combobox')).toHaveClass('custom-class')
    })
  })

  describe('chevron icon', () => {
    it('should render chevron icon', () => {
      const { container } = render(<Select options={mockOptions} />)
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('should have pointer-events-none on icon container', () => {
      const { container } = render(<Select options={mockOptions} />)
      const iconContainer = container.querySelector('.pointer-events-none')
      expect(iconContainer).toBeInTheDocument()
    })
  })
})

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from '@testing-library/react'
import { ToastContainer } from '@/components/ui/Toast'
import { useToastStore } from '@/stores/toastStore'

describe('ToastContainer', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    act(() => {
      useToastStore.getState().clearToasts()
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('rendering', () => {
    it('should render nothing when no toasts', () => {
      const { container } = render(<ToastContainer />)
      // Wait for hydration
      act(() => {
        jest.advanceTimersByTime(0)
      })
      expect(container.querySelector('[class*="toast"]')).not.toBeInTheDocument()
    })

    it('should render toast when added', async () => {
      render(<ToastContainer />)

      act(() => {
        jest.advanceTimersByTime(0)
        useToastStore.getState().addToast({
          type: 'success',
          message: 'Test toast message',
          duration: 0,
        })
      })

      await waitFor(() => {
        expect(screen.getByText('Test toast message')).toBeInTheDocument()
      })
    })

    it('should render multiple toasts', async () => {
      render(<ToastContainer />)

      act(() => {
        jest.advanceTimersByTime(0)
        useToastStore.getState().addToast({
          type: 'success',
          message: 'Success message',
          duration: 0,
        })
        useToastStore.getState().addToast({
          type: 'error',
          message: 'Error message',
          duration: 0,
        })
      })

      await waitFor(() => {
        expect(screen.getByText('Success message')).toBeInTheDocument()
        expect(screen.getByText('Error message')).toBeInTheDocument()
      })
    })
  })

  describe('toast types', () => {
    it('should render success toast with correct styling', async () => {
      render(<ToastContainer />)

      act(() => {
        jest.advanceTimersByTime(0)
        useToastStore.getState().addToast({
          type: 'success',
          message: 'Success!',
          duration: 0,
        })
      })

      await waitFor(() => {
        const toast = screen.getByText('Success!').closest('div')
        expect(toast).toHaveClass('bg-green-50')
      })
    })

    it('should render error toast with correct styling', async () => {
      render(<ToastContainer />)

      act(() => {
        jest.advanceTimersByTime(0)
        useToastStore.getState().addToast({
          type: 'error',
          message: 'Error!',
          duration: 0,
        })
      })

      await waitFor(() => {
        const toast = screen.getByText('Error!').closest('div')
        expect(toast).toHaveClass('bg-red-50')
      })
    })

    it('should render info toast with correct styling', async () => {
      render(<ToastContainer />)

      act(() => {
        jest.advanceTimersByTime(0)
        useToastStore.getState().addToast({
          type: 'info',
          message: 'Info!',
          duration: 0,
        })
      })

      await waitFor(() => {
        const toast = screen.getByText('Info!').closest('div')
        expect(toast).toHaveClass('bg-blue-50')
      })
    })

    it('should render warning toast with correct styling', async () => {
      render(<ToastContainer />)

      act(() => {
        jest.advanceTimersByTime(0)
        useToastStore.getState().addToast({
          type: 'warning',
          message: 'Warning!',
          duration: 0,
        })
      })

      await waitFor(() => {
        const toast = screen.getByText('Warning!').closest('div')
        expect(toast).toHaveClass('bg-yellow-50')
      })
    })
  })

  describe('close button', () => {
    it('should render close button', async () => {
      render(<ToastContainer />)

      act(() => {
        jest.advanceTimersByTime(0)
        useToastStore.getState().addToast({
          type: 'success',
          message: 'Closable toast',
          duration: 0,
        })
      })

      await waitFor(() => {
        const closeButton = screen.getByRole('button')
        expect(closeButton).toBeInTheDocument()
      })
    })

    it('should remove toast when close button is clicked', async () => {
      render(<ToastContainer />)

      act(() => {
        jest.advanceTimersByTime(0)
        useToastStore.getState().addToast({
          type: 'success',
          message: 'Closable toast',
          duration: 0,
        })
      })

      await waitFor(() => {
        expect(screen.getByText('Closable toast')).toBeInTheDocument()
      })

      const closeButton = screen.getByRole('button')
      fireEvent.click(closeButton)

      await waitFor(() => {
        expect(screen.queryByText('Closable toast')).not.toBeInTheDocument()
      })
    })
  })

  describe('positioning', () => {
    it('should be fixed positioned', async () => {
      const { container } = render(<ToastContainer />)

      act(() => {
        jest.advanceTimersByTime(0)
      })

      const toastContainer = container.firstChild
      expect(toastContainer).toHaveClass('fixed')
    })

    it('should be positioned at bottom-right', async () => {
      const { container } = render(<ToastContainer />)

      act(() => {
        jest.advanceTimersByTime(0)
      })

      const toastContainer = container.firstChild
      expect(toastContainer).toHaveClass('bottom-4', 'right-4')
    })

    it('should have high z-index', async () => {
      const { container } = render(<ToastContainer />)

      act(() => {
        jest.advanceTimersByTime(0)
      })

      const toastContainer = container.firstChild
      expect(toastContainer).toHaveClass('z-50')
    })
  })
})

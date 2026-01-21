import { act } from '@testing-library/react'
import { useToastStore, toast } from '@/stores/toastStore'

describe('toastStore', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    act(() => {
      useToastStore.getState().clearToasts()
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('initial state', () => {
    it('should have empty toasts initially', () => {
      expect(useToastStore.getState().toasts).toEqual([])
    })
  })

  describe('addToast', () => {
    it('should add toast to list', () => {
      act(() => {
        useToastStore.getState().addToast({
          type: 'success',
          message: 'Test message',
        })
      })

      const state = useToastStore.getState()
      expect(state.toasts).toHaveLength(1)
      expect(state.toasts[0].type).toBe('success')
      expect(state.toasts[0].message).toBe('Test message')
    })

    it('should generate unique IDs', () => {
      act(() => {
        useToastStore.getState().addToast({ type: 'success', message: 'Toast 1' })
        useToastStore.getState().addToast({ type: 'error', message: 'Toast 2' })
      })

      const state = useToastStore.getState()
      expect(state.toasts[0].id).not.toBe(state.toasts[1].id)
    })

    it('should auto-remove toast after default duration', () => {
      act(() => {
        useToastStore.getState().addToast({
          type: 'success',
          message: 'Auto-remove test',
        })
      })

      expect(useToastStore.getState().toasts).toHaveLength(1)

      act(() => {
        jest.advanceTimersByTime(4000)
      })

      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it('should use custom duration', () => {
      act(() => {
        useToastStore.getState().addToast({
          type: 'success',
          message: 'Custom duration',
          duration: 2000,
        })
      })

      act(() => {
        jest.advanceTimersByTime(1500)
      })
      expect(useToastStore.getState().toasts).toHaveLength(1)

      act(() => {
        jest.advanceTimersByTime(500)
      })
      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it('should not auto-remove if duration is 0', () => {
      act(() => {
        useToastStore.getState().addToast({
          type: 'success',
          message: 'Persistent toast',
          duration: 0,
        })
      })

      act(() => {
        jest.advanceTimersByTime(10000)
      })

      expect(useToastStore.getState().toasts).toHaveLength(1)
    })

    it('should add multiple toasts', () => {
      act(() => {
        useToastStore.getState().addToast({ type: 'success', message: 'Success' })
        useToastStore.getState().addToast({ type: 'error', message: 'Error' })
        useToastStore.getState().addToast({ type: 'info', message: 'Info' })
        useToastStore.getState().addToast({ type: 'warning', message: 'Warning' })
      })

      expect(useToastStore.getState().toasts).toHaveLength(4)
    })
  })

  describe('removeToast', () => {
    it('should remove specific toast by id', () => {
      act(() => {
        useToastStore.getState().addToast({ type: 'success', message: 'Toast 1', duration: 0 })
        useToastStore.getState().addToast({ type: 'error', message: 'Toast 2', duration: 0 })
      })

      const toastId = useToastStore.getState().toasts[0].id

      act(() => {
        useToastStore.getState().removeToast(toastId)
      })

      const state = useToastStore.getState()
      expect(state.toasts).toHaveLength(1)
      expect(state.toasts[0].message).toBe('Toast 2')
    })

    it('should handle removing non-existent toast', () => {
      act(() => {
        useToastStore.getState().addToast({ type: 'success', message: 'Test', duration: 0 })
        useToastStore.getState().removeToast('non-existent')
      })

      expect(useToastStore.getState().toasts).toHaveLength(1)
    })
  })

  describe('clearToasts', () => {
    it('should remove all toasts', () => {
      act(() => {
        useToastStore.getState().addToast({ type: 'success', message: 'Toast 1', duration: 0 })
        useToastStore.getState().addToast({ type: 'error', message: 'Toast 2', duration: 0 })
        useToastStore.getState().addToast({ type: 'info', message: 'Toast 3', duration: 0 })
        useToastStore.getState().clearToasts()
      })

      expect(useToastStore.getState().toasts).toEqual([])
    })

    it('should work on empty toasts', () => {
      act(() => {
        useToastStore.getState().clearToasts()
      })

      expect(useToastStore.getState().toasts).toEqual([])
    })
  })

  describe('toast helper functions', () => {
    it('toast.success should add success toast', () => {
      act(() => {
        toast.success('Success message')
      })

      const state = useToastStore.getState()
      expect(state.toasts).toHaveLength(1)
      expect(state.toasts[0].type).toBe('success')
      expect(state.toasts[0].message).toBe('Success message')
    })

    it('toast.error should add error toast', () => {
      act(() => {
        toast.error('Error message')
      })

      const state = useToastStore.getState()
      expect(state.toasts).toHaveLength(1)
      expect(state.toasts[0].type).toBe('error')
    })

    it('toast.info should add info toast', () => {
      act(() => {
        toast.info('Info message')
      })

      const state = useToastStore.getState()
      expect(state.toasts).toHaveLength(1)
      expect(state.toasts[0].type).toBe('info')
    })

    it('toast.warning should add warning toast', () => {
      act(() => {
        toast.warning('Warning message')
      })

      const state = useToastStore.getState()
      expect(state.toasts).toHaveLength(1)
      expect(state.toasts[0].type).toBe('warning')
    })

    it('toast helpers should accept custom duration', () => {
      act(() => {
        toast.success('Custom duration', 1000)
      })

      act(() => {
        jest.advanceTimersByTime(500)
      })
      expect(useToastStore.getState().toasts).toHaveLength(1)

      act(() => {
        jest.advanceTimersByTime(500)
      })
      expect(useToastStore.getState().toasts).toHaveLength(0)
    })
  })
})

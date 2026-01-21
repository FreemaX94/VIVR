require('@testing-library/jest-dom')

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    const { fill, priority, ...rest } = props
    return require('react').createElement('img', {
      ...rest,
      'data-fill': fill ? 'true' : undefined,
      'data-priority': priority ? 'true' : undefined,
    })
  },
}))

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children,
}))

// Mock framer-motion
jest.mock('framer-motion', () => {
  const React = require('react')
  return {
    motion: {
      div: React.forwardRef(({ children, ...props }, ref) =>
        React.createElement('div', { ...props, ref }, children)
      ),
      button: React.forwardRef(({ children, ...props }, ref) =>
        React.createElement('button', { ...props, ref }, children)
      ),
      span: React.forwardRef(({ children, ...props }, ref) =>
        React.createElement('span', { ...props, ref }, children)
      ),
      form: React.forwardRef(({ children, ...props }, ref) =>
        React.createElement('form', { ...props, ref }, children)
      ),
      article: React.forwardRef(({ children, ...props }, ref) =>
        React.createElement('article', { ...props, ref }, children)
      ),
      img: (props) => React.createElement('img', props),
    },
    AnimatePresence: ({ children }) => children,
    useAnimation: () => ({
      start: jest.fn(),
      set: jest.fn(),
    }),
  }
})

// Browser-only mocks (for jsdom environment)
if (typeof window !== 'undefined') {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })

  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  }
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  })

  // Mock IntersectionObserver
  class IntersectionObserverMock {
    observe = jest.fn()
    disconnect = jest.fn()
    unobserve = jest.fn()
  }
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserverMock,
  })
}

// Suppress console errors during tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
       args[0].includes('non-boolean attribute `fill`') ||
       args[0].includes('non-boolean attribute `priority`') ||
       args[0].includes('<a> cannot appear as a descendant of <a>'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

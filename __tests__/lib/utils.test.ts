import {
  cn,
  formatPrice,
  formatDate,
  slugify,
  truncate,
  calculateDiscount,
  getInitials,
  debounce,
  generateOrderNumber,
} from '@/lib/utils'

describe('lib/utils', () => {
  describe('cn (className merger)', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'included', false && 'excluded')).toBe('base included')
    })

    it('should merge Tailwind classes and remove conflicts', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2')
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('should handle array inputs', () => {
      expect(cn(['class1', 'class2'])).toBe('class1 class2')
    })

    it('should handle object inputs', () => {
      expect(cn({ class1: true, class2: false, class3: true })).toBe('class1 class3')
    })

    it('should handle undefined and null', () => {
      expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2')
    })

    it('should handle empty string', () => {
      expect(cn('')).toBe('')
    })

    it('should handle mixed inputs', () => {
      expect(cn('base', ['arr1', 'arr2'], { obj: true })).toBe('base arr1 arr2 obj')
    })
  })

  describe('formatPrice', () => {
    it('should format price in EUR with French locale', () => {
      const result = formatPrice(99.99)
      expect(result).toContain('99,99')
      expect(result).toContain('€')
    })

    it('should handle whole numbers', () => {
      const result = formatPrice(100)
      expect(result).toContain('100')
      expect(result).toContain('€')
    })

    it('should handle zero', () => {
      const result = formatPrice(0)
      expect(result).toContain('0')
      expect(result).toContain('€')
    })

    it('should handle large numbers', () => {
      const result = formatPrice(1234567.89)
      expect(result).toContain('€')
    })

    it('should handle negative numbers', () => {
      const result = formatPrice(-50)
      expect(result).toContain('50')
      expect(result).toContain('€')
    })

    it('should handle decimal precision', () => {
      const result = formatPrice(99.999)
      expect(result).toContain('€')
    })
  })

  describe('formatDate', () => {
    it('should format Date object correctly in French', () => {
      const date = new Date('2024-01-15')
      const result = formatDate(date)
      expect(result).toContain('15')
      expect(result).toContain('janvier')
      expect(result).toContain('2024')
    })

    it('should format ISO string correctly', () => {
      const result = formatDate('2024-06-20')
      expect(result).toContain('20')
      expect(result).toContain('juin')
      expect(result).toContain('2024')
    })

    it('should handle different months', () => {
      const months = [
        { date: '2024-01-01', expected: 'janvier' },
        { date: '2024-02-01', expected: 'février' },
        { date: '2024-03-01', expected: 'mars' },
        { date: '2024-12-01', expected: 'décembre' },
      ]
      months.forEach(({ date, expected }) => {
        expect(formatDate(date)).toContain(expected)
      })
    })

    it('should handle timestamp string', () => {
      const result = formatDate('2024-01-15T10:30:00Z')
      expect(result).toContain('2024')
    })
  })

  describe('slugify', () => {
    it('should convert text to lowercase', () => {
      expect(slugify('HELLO WORLD')).toBe('hello-world')
    })

    it('should replace spaces with hyphens', () => {
      expect(slugify('hello world')).toBe('hello-world')
    })

    it('should remove accents', () => {
      expect(slugify('café résumé')).toBe('cafe-resume')
      expect(slugify('éàüïôç')).toBe('eauioc')
    })

    it('should remove special characters', () => {
      expect(slugify('hello! world?')).toBe('hello-world')
      expect(slugify('test@#$%')).toBe('test')
    })

    it('should handle multiple spaces', () => {
      expect(slugify('hello    world')).toBe('hello-world')
    })

    it('should remove leading and trailing hyphens', () => {
      expect(slugify('  hello world  ')).toBe('hello-world')
      expect(slugify('---hello---')).toBe('hello')
    })

    it('should handle empty string', () => {
      expect(slugify('')).toBe('')
    })

    it('should handle numbers', () => {
      expect(slugify('product 123')).toBe('product-123')
    })

    it('should handle French text', () => {
      expect(slugify('Lampe de table Nordique')).toBe('lampe-de-table-nordique')
    })
  })

  describe('truncate', () => {
    it('should not truncate text shorter than length', () => {
      expect(truncate('hello', 10)).toBe('hello')
    })

    it('should truncate text longer than length and add ellipsis', () => {
      expect(truncate('hello world', 5)).toBe('hello...')
    })

    it('should handle exact length', () => {
      expect(truncate('hello', 5)).toBe('hello')
    })

    it('should handle empty string', () => {
      expect(truncate('', 5)).toBe('')
    })

    it('should handle length of 0', () => {
      expect(truncate('hello', 0)).toBe('...')
    })

    it('should handle very long text', () => {
      const longText = 'a'.repeat(1000)
      const result = truncate(longText, 10)
      expect(result).toBe('aaaaaaaaaa...')
      expect(result.length).toBe(13)
    })
  })

  describe('calculateDiscount', () => {
    it('should calculate discount percentage correctly', () => {
      expect(calculateDiscount(80, 100)).toBe(20)
      expect(calculateDiscount(50, 100)).toBe(50)
      expect(calculateDiscount(75, 100)).toBe(25)
    })

    it('should round to nearest integer', () => {
      expect(calculateDiscount(89.99, 129.99)).toBe(31)
    })

    it('should return 0 if no compare price', () => {
      expect(calculateDiscount(100, 0)).toBe(0)
    })

    it('should return 0 if compare price is less than price', () => {
      expect(calculateDiscount(100, 80)).toBe(0)
    })

    it('should return 0 if compare price equals price', () => {
      expect(calculateDiscount(100, 100)).toBe(0)
    })

    it('should handle small discounts', () => {
      expect(calculateDiscount(99, 100)).toBe(1)
    })

    it('should handle large discounts', () => {
      expect(calculateDiscount(10, 100)).toBe(90)
    })
  })

  describe('getInitials', () => {
    it('should get initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD')
    })

    it('should handle single name', () => {
      expect(getInitials('John')).toBe('J')
    })

    it('should limit to 2 characters', () => {
      expect(getInitials('John Michael Doe')).toBe('JM')
    })

    it('should convert to uppercase', () => {
      expect(getInitials('john doe')).toBe('JD')
    })

    it('should handle multiple spaces', () => {
      expect(getInitials('John  Doe')).toBe('JD')
    })

    it('should handle names with accents', () => {
      expect(getInitials('Éric Dupont')).toBe('ÉD')
    })
  })

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should delay function execution', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      expect(mockFn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should only execute once for multiple rapid calls', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      jest.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should pass arguments to the debounced function', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('arg1', 'arg2')
      jest.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('should use the latest arguments', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('first')
      debouncedFn('second')
      debouncedFn('third')

      jest.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledWith('third')
    })

    it('should reset timer on each call', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      jest.advanceTimersByTime(50)
      debouncedFn()
      jest.advanceTimersByTime(50)

      expect(mockFn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(50)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('generateOrderNumber', () => {
    it('should generate order number with VIV prefix', () => {
      const orderNumber = generateOrderNumber()
      expect(orderNumber).toMatch(/^VIV-/)
    })

    it('should generate unique order numbers', () => {
      const orderNumbers = new Set<string>()
      for (let i = 0; i < 100; i++) {
        orderNumbers.add(generateOrderNumber())
      }
      expect(orderNumbers.size).toBe(100)
    })

    it('should be uppercase', () => {
      const orderNumber = generateOrderNumber()
      expect(orderNumber).toBe(orderNumber.toUpperCase())
    })

    it('should have correct format with two parts', () => {
      const orderNumber = generateOrderNumber()
      const parts = orderNumber.split('-')
      expect(parts).toHaveLength(3)
      expect(parts[0]).toBe('VIV')
    })

    it('should contain only alphanumeric characters and hyphens', () => {
      const orderNumber = generateOrderNumber()
      expect(orderNumber).toMatch(/^[A-Z0-9-]+$/)
    })
  })
})

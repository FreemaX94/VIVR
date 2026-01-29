import {
  toNumber,
  formatMoney,
  parseMoney,
  isValidAmount,
  calculateOrderTotal,
  calculateSubtotal,
  applyDiscount,
  calculateTax,
  formatSavings,
  amountsEqual,
  convertCurrency,
  validateOrderAmounts,
} from '@/lib/money'

describe('lib/money', () => {
  describe('toNumber', () => {
    it('should return number as-is', () => {
      expect(toNumber(99.99)).toBe(99.99)
    })

    it('should return 0 for null', () => {
      expect(toNumber(null)).toBe(0)
    })

    it('should return 0 for undefined', () => {
      expect(toNumber(undefined)).toBe(0)
    })

    it('should handle zero', () => {
      expect(toNumber(0)).toBe(0)
    })

    it('should handle large numbers', () => {
      expect(toNumber(999999.99)).toBe(999999.99)
    })

    it('should handle small decimal numbers', () => {
      expect(toNumber(0.01)).toBeCloseTo(0.01, 2)
    })
  })

  describe('formatMoney', () => {
    it('should format number in EUR with French locale', () => {
      const result = formatMoney(99.99)
      expect(result).toContain('99,99')
      expect(result).toContain('€')
    })

    it('should handle null/undefined', () => {
      expect(formatMoney(null)).toContain('0,00')
      expect(formatMoney(undefined)).toContain('0,00')
    })

    it('should format with custom currency', () => {
      const result = formatMoney(50, 'USD', 'en-US')
      expect(result).toContain('50')
      expect(result).toContain('$')
    })

    it('should format with custom locale', () => {
      const result = formatMoney(1000, 'EUR', 'de-DE')
      expect(result).toContain('€')
    })

    it('should handle zero', () => {
      const result = formatMoney(0)
      expect(result).toContain('0,00')
    })

    it('should round to 2 decimal places', () => {
      const result = formatMoney(99.999)
      expect(result).toContain('100,00')
    })

    it('should handle negative numbers (for refunds)', () => {
      const result = formatMoney(-50)
      expect(result).toContain('50')
    })
  })

  describe('parseMoney', () => {
    it('should parse number and round to 2 decimals', () => {
      expect(parseMoney(99.99)).toBe(99.99)
    })

    it('should parse string to number', () => {
      expect(parseMoney('149.50')).toBe(149.50)
    })

    it('should round to 2 decimal places', () => {
      expect(parseMoney(99.999)).toBe(100)
    })

    it('should throw for non-finite values', () => {
      expect(() => parseMoney(Infinity)).toThrow('Invalid money value')
      expect(() => parseMoney(NaN)).toThrow('Invalid money value')
    })

    it('should throw for negative values', () => {
      expect(() => parseMoney(-50)).toThrow('Money value cannot be negative')
    })

    it('should handle zero', () => {
      expect(parseMoney(0)).toBe(0)
    })

    it('should parse string with multiple decimals', () => {
      expect(parseMoney('99.995')).toBe(100)
    })

    it('should handle string representation of integers', () => {
      expect(parseMoney('100')).toBe(100)
    })
  })

  describe('isValidAmount', () => {
    it('should return true for positive number', () => {
      expect(isValidAmount(99.99)).toBe(true)
    })

    it('should return true for zero', () => {
      expect(isValidAmount(0)).toBe(true)
    })

    it('should return true for valid string', () => {
      expect(isValidAmount('99.99')).toBe(true)
    })

    it('should return false for negative number', () => {
      expect(isValidAmount(-50)).toBe(false)
    })

    it('should return false for negative string', () => {
      expect(isValidAmount('-50')).toBe(false)
    })

    it('should return false for non-numeric string', () => {
      expect(isValidAmount('abc')).toBe(false)
    })

    it('should return false for null', () => {
      expect(isValidAmount(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isValidAmount(undefined)).toBe(false)
    })

    it('should return false for objects', () => {
      expect(isValidAmount({})).toBe(false)
    })

    it('should return false for arrays', () => {
      expect(isValidAmount([99])).toBe(false)
    })

    it('should return false for Infinity', () => {
      expect(isValidAmount(Infinity)).toBe(false)
    })

    it('should return false for NaN', () => {
      expect(isValidAmount(NaN)).toBe(false)
    })
  })

  describe('calculateOrderTotal', () => {
    it('should calculate total with subtotal and shipping', () => {
      expect(calculateOrderTotal(100, 5)).toBe(105)
    })

    it('should calculate total with all components', () => {
      // 100 + 5 + 20 - 10 = 115
      expect(calculateOrderTotal(100, 5, 20, 10)).toBe(115)
    })

    it('should round to 2 decimal places', () => {
      expect(calculateOrderTotal(100.001, 5.999)).toBe(106)
    })

    it('should default tax and discount to 0', () => {
      expect(calculateOrderTotal(100, 10)).toBe(110)
    })

    it('should handle zero values', () => {
      expect(calculateOrderTotal(0, 0, 0, 0)).toBe(0)
    })

    it('should handle discount larger than subtotal', () => {
      expect(calculateOrderTotal(50, 5, 0, 100)).toBe(-45)
    })
  })

  describe('calculateSubtotal', () => {
    it('should calculate subtotal from items', () => {
      const items = [
        { price: 50, quantity: 2 },
        { price: 25, quantity: 3 },
      ]
      // (50 * 2) + (25 * 3) = 100 + 75 = 175
      expect(calculateSubtotal(items)).toBe(175)
    })

    it('should return 0 for empty items array', () => {
      expect(calculateSubtotal([])).toBe(0)
    })

    it('should round to 2 decimal places', () => {
      const items = [{ price: 33.333, quantity: 3 }]
      expect(calculateSubtotal(items)).toBe(100)
    })

    it('should handle single item', () => {
      const items = [{ price: 89.99, quantity: 1 }]
      expect(calculateSubtotal(items)).toBe(89.99)
    })

    it('should handle large quantities', () => {
      const items = [{ price: 10, quantity: 1000 }]
      expect(calculateSubtotal(items)).toBe(10000)
    })
  })

  describe('applyDiscount', () => {
    it('should apply percentage discount', () => {
      expect(applyDiscount(100, 10)).toBe(90)
    })

    it('should apply 0% discount', () => {
      expect(applyDiscount(100, 0)).toBe(100)
    })

    it('should apply 100% discount', () => {
      expect(applyDiscount(100, 100)).toBe(0)
    })

    it('should throw for negative discount', () => {
      expect(() => applyDiscount(100, -10)).toThrow('Discount percent must be between 0 and 100')
    })

    it('should throw for discount over 100', () => {
      expect(() => applyDiscount(100, 150)).toThrow('Discount percent must be between 0 and 100')
    })

    it('should round discount amount to 2 decimal places', () => {
      // 99.99 * 0.15 = 14.9985, rounded to 15.00
      // 99.99 - 15.00 = 84.99
      expect(applyDiscount(99.99, 15)).toBe(84.99)
    })
  })

  describe('calculateTax', () => {
    it('should calculate tax amount', () => {
      expect(calculateTax(100, 20)).toBe(20)
    })

    it('should handle 0% tax', () => {
      expect(calculateTax(100, 0)).toBe(0)
    })

    it('should throw for negative tax rate', () => {
      expect(() => calculateTax(100, -5)).toThrow('Tax percent must be non-negative')
    })

    it('should handle tax rates over 100%', () => {
      expect(calculateTax(100, 150)).toBe(150)
    })

    it('should round to 2 decimal places', () => {
      expect(calculateTax(99.99, 21)).toBe(21)
    })
  })

  describe('formatSavings', () => {
    it('should format savings amount and percent', () => {
      const result = formatSavings(100, 80)
      expect(result.amount).toContain('20')
      expect(result.amount).toContain('€')
      expect(result.percent).toBe('20%')
    })

    it('should handle zero savings', () => {
      const result = formatSavings(100, 100)
      expect(result.amount).toContain('0')
      expect(result.percent).toBe('0%')
    })

    it('should handle custom currency', () => {
      const result = formatSavings(100, 80, 'USD', 'en-US')
      expect(result.amount).toContain('$')
      expect(result.amount).toContain('20')
    })
  })

  describe('amountsEqual', () => {
    it('should return true for equal amounts', () => {
      expect(amountsEqual(100, 100)).toBe(true)
    })

    it('should return true for amounts within tolerance', () => {
      expect(amountsEqual(100, 100.005)).toBe(true)
    })

    it('should return false for amounts outside tolerance', () => {
      expect(amountsEqual(100, 100.02)).toBe(false)
    })

    it('should handle null values', () => {
      expect(amountsEqual(null, null)).toBe(true)
      expect(amountsEqual(null, 0)).toBe(true)
      expect(amountsEqual(100, null)).toBe(false)
    })

    it('should use custom tolerance', () => {
      expect(amountsEqual(100, 100.5, 1)).toBe(true)
      expect(amountsEqual(100, 101.5, 1)).toBe(false)
    })
  })

  describe('convertCurrency', () => {
    it('should convert with exchange rate', () => {
      expect(convertCurrency(100, 'EUR', 'USD', 1.10)).toBe(110)
    })

    it('should round to 2 decimal places', () => {
      expect(convertCurrency(100, 'EUR', 'USD', 1.123456)).toBe(112.35)
    })

    it('should handle exchange rate of 1', () => {
      expect(convertCurrency(100, 'EUR', 'EUR', 1)).toBe(100)
    })

    it('should handle fractional exchange rates', () => {
      expect(convertCurrency(100, 'USD', 'EUR', 0.92)).toBe(92)
    })
  })

  describe('validateOrderAmounts', () => {
    it('should return valid for correct order', () => {
      const result = validateOrderAmounts({
        subtotal: 100,
        shipping: 5,
        tax: 21,
        discount: 10,
        total: 116,
      })
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should return invalid for incorrect total', () => {
      const result = validateOrderAmounts({
        subtotal: 100,
        shipping: 5,
        tax: 0,
        discount: 0,
        total: 110, // Should be 105
      })
      expect(result.valid).toBe(false)
      expect(result.error).toContain('mismatch')
    })

    it('should default tax and discount to 0', () => {
      const result = validateOrderAmounts({
        subtotal: 100,
        shipping: 10,
        total: 110,
      })
      expect(result.valid).toBe(true)
    })

    it('should handle edge case with rounding', () => {
      const result = validateOrderAmounts({
        subtotal: 99.99,
        shipping: 5.99,
        total: 105.98,
      })
      expect(result.valid).toBe(true)
    })

    it('should handle zero order', () => {
      const result = validateOrderAmounts({
        subtotal: 0,
        shipping: 0,
        total: 0,
      })
      expect(result.valid).toBe(true)
    })

    it('should return error details for validation failures', () => {
      const result = validateOrderAmounts({
        subtotal: 100,
        shipping: 5,
        total: 999,
      })
      expect(result.valid).toBe(false)
      expect(result.error).toContain('expected')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very small amounts', () => {
      const result = formatMoney(0.01)
      expect(result).toContain('0,01')
    })

    it('should handle very large amounts', () => {
      const result = formatMoney(9999999.99)
      expect(result).toContain('€')
    })

    it('should handle precision in calculations', () => {
      const items = [
        { price: 0.1, quantity: 1 },
        { price: 0.2, quantity: 1 },
      ]
      expect(calculateSubtotal(items)).toBe(0.3)
    })

    it('should maintain precision across multiple operations', () => {
      const subtotal = calculateSubtotal([
        { price: 33.33, quantity: 3 },
      ])
      const tax = calculateTax(subtotal, 20)
      const withTax = subtotal + tax
      const afterDiscount = applyDiscount(withTax, 10)

      // 33.33 * 3 = 99.99
      // + 20% tax = 99.99 + 20.00 = 119.99
      // - 10% = 119.99 - 12.00 = 107.99
      expect(afterDiscount).toBeCloseTo(107.99, 2)
    })
  })
})

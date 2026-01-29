/**
 * Money handling utilities for e-commerce
 * Uses native JS numbers (compatible with SQLite Float fields)
 */

/**
 * Convert any numeric value to a JavaScript number
 */
export function toNumber(value: number | null | undefined): number {
  if (!value) return 0
  return Number(value)
}

/**
 * Format money for display with proper locale-based formatting
 */
export function formatMoney(
  amount: number | null | undefined,
  currency: string = 'EUR',
  locale: string = 'fr-FR'
): string {
  if (!amount) return formatCurrency(0, currency, locale)
  return formatCurrency(amount, currency, locale)
}

/**
 * Helper for currency formatting
 */
function formatCurrency(
  amount: number,
  currency: string,
  locale: string
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch (error) {
    console.error('Currency formatting error:', error)
    return `${amount.toFixed(2)} ${currency}`
  }
}

/**
 * Parse and validate a money value from user input
 * Returns a number rounded to 2 decimal places
 */
export function parseMoney(value: string | number): number {
  let num: number

  if (typeof value === 'string') {
    num = parseFloat(value)
  } else {
    num = value
  }

  if (!Number.isFinite(num)) {
    throw new Error(`Invalid money value: ${value}`)
  }

  if (num < 0) {
    throw new Error(`Money value cannot be negative: ${value}`)
  }

  return Math.round(num * 100) / 100
}

/**
 * Validate if a value is a valid money amount
 */
export function isValidAmount(amount: unknown): amount is number | string {
  if (typeof amount === 'number') {
    return Number.isFinite(amount) && amount >= 0
  }

  if (typeof amount === 'string') {
    const num = parseFloat(amount)
    return Number.isFinite(num) && num >= 0
  }

  return false
}

/**
 * Calculate order total
 */
export function calculateOrderTotal(
  subtotal: number,
  shipping: number,
  tax: number = 0,
  discount: number = 0
): number {
  return Math.round((subtotal + shipping + tax - discount) * 100) / 100
}

/**
 * Calculate subtotal from items
 */
export function calculateSubtotal(
  items: Array<{ price: number; quantity: number }>
): number {
  const total = items.reduce((acc, item) => {
    return acc + item.price * item.quantity
  }, 0)
  return Math.round(total * 100) / 100
}

/**
 * Apply discount to amount
 * discountPercent should be between 0 and 100
 */
export function applyDiscount(
  amount: number,
  discountPercent: number
): number {
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error('Discount percent must be between 0 and 100')
  }

  const discount = Math.round((amount * discountPercent) / 100 * 100) / 100
  return amount - discount
}

/**
 * Calculate tax on amount
 */
export function calculateTax(
  amount: number,
  taxPercent: number
): number {
  if (taxPercent < 0) {
    throw new Error('Tax percent must be non-negative')
  }

  return Math.round((amount * taxPercent) / 100 * 100) / 100
}

/**
 * Format money difference (for showing discount/savings)
 */
export function formatSavings(
  original: number,
  discounted: number,
  currency: string = 'EUR',
  locale: string = 'fr-FR'
): {
  amount: string
  percent: string
} {
  const savingsAmount = original - discounted
  const savingsPercent = (savingsAmount / original) * 100

  return {
    amount: formatMoney(savingsAmount, currency, locale),
    percent: `${savingsPercent.toFixed(0)}%`,
  }
}

/**
 * Safe comparison for amounts
 */
export function amountsEqual(
  a: number | null,
  b: number | null,
  tolerance: number = 0.01
): boolean {
  const numA = a ?? 0
  const numB = b ?? 0
  return Math.abs(numA - numB) < tolerance
}

/**
 * Convert between currencies
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRate: number
): number {
  return Math.round(amount * exchangeRate * 100) / 100
}

/**
 * Validate that amounts in an order are consistent
 */
export function validateOrderAmounts(order: {
  subtotal: number
  shipping: number
  tax?: number
  discount?: number
  total: number
}): { valid: boolean; error?: string } {
  try {
    const expected = calculateOrderTotal(
      order.subtotal,
      order.shipping,
      order.tax || 0,
      order.discount || 0
    )

    if (!amountsEqual(expected, order.total)) {
      return {
        valid: false,
        error: `Total mismatch: expected ${expected}, got ${order.total}`,
      }
    }

    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

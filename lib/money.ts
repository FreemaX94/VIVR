/**
 * Money/Decimal handling utilities for e-commerce
 * Provides type-safe conversion and formatting for currency operations
 */

import { Decimal } from '@prisma/client/runtime/library'

/**
 * Convert Prisma Decimal to JavaScript number
 * Use only for display purposes or calculations that have already been rounded
 * NEVER use this for financial calculations - do those in the database
 */
export function toNumber(decimal: Decimal | null | undefined): number {
  if (!decimal) return 0
  return Number(decimal)
}

/**
 * Format money for display with proper locale-based formatting
 * Automatically handles rounding and currency symbol
 */
export function formatMoney(
  amount: Decimal | number | null | undefined,
  currency: string = 'EUR',
  locale: string = 'fr-FR'
): string {
  if (!amount) return formatCurrency(0, currency, locale)

  const numAmount = amount instanceof Decimal ? Number(amount) : amount
  return formatCurrency(numAmount, currency, locale)
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
 * Create Decimal from number or string with proper rounding
 * Use when accepting user input for money fields
 */
export function parseMoney(value: string | number): Decimal {
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

  // Round to 2 decimal places using banker's rounding (ROUND_HALF_UP)
  return new Decimal(num).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
}

/**
 * Validate if a value is a valid money amount
 */
export function isValidAmount(
  amount: unknown
): amount is Decimal | number | string {
  if (amount instanceof Decimal) {
    return true
  }

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
 * Calculate order total with proper decimal arithmetic
 * This is a utility - ideally the database should calculate the final total
 */
export function calculateOrderTotal(
  subtotal: Decimal | number,
  shipping: Decimal | number,
  tax: Decimal | number = 0,
  discount: Decimal | number = 0
): Decimal {
  const subtotalDecimal =
    subtotal instanceof Decimal ? subtotal : new Decimal(subtotal)
  const shippingDecimal =
    shipping instanceof Decimal ? shipping : new Decimal(shipping)
  const taxDecimal = tax instanceof Decimal ? tax : new Decimal(tax)
  const discountDecimal =
    discount instanceof Decimal ? discount : new Decimal(discount)

  return subtotalDecimal
    .plus(shippingDecimal)
    .plus(taxDecimal)
    .minus(discountDecimal)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
}

/**
 * Calculate subtotal from items
 * Use when calculating from order items array
 */
export function calculateSubtotal(
  items: Array<{ price: Decimal | number; quantity: number }>
): Decimal {
  return items
    .reduce((total, item) => {
      const itemPrice =
        item.price instanceof Decimal
          ? item.price
          : new Decimal(item.price)
      return total.plus(itemPrice.times(item.quantity))
    }, new Decimal(0))
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
}

/**
 * Apply discount to amount
 * discountPercent should be between 0 and 100
 */
export function applyDiscount(
  amount: Decimal | number,
  discountPercent: number
): Decimal {
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error('Discount percent must be between 0 and 100')
  }

  const amountDecimal =
    amount instanceof Decimal ? amount : new Decimal(amount)
  const discount = amountDecimal
    .times(discountPercent)
    .dividedBy(100)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)

  return amountDecimal.minus(discount)
}

/**
 * Calculate tax on amount
 * taxPercent should be between 0 and 100
 */
export function calculateTax(
  amount: Decimal | number,
  taxPercent: number
): Decimal {
  if (taxPercent < 0) {
    throw new Error('Tax percent must be non-negative')
  }

  const amountDecimal =
    amount instanceof Decimal ? amount : new Decimal(amount)
  const tax = amountDecimal
    .times(taxPercent)
    .dividedBy(100)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)

  return tax
}

/**
 * Format money difference (for showing discount/savings)
 */
export function formatSavings(
  original: Decimal | number,
  discounted: Decimal | number,
  currency: string = 'EUR',
  locale: string = 'fr-FR'
): {
  amount: string
  percent: string
} {
  const originalNum = toNumber(original as any)
  const discountedNum = toNumber(discounted as any)
  const savingsAmount = originalNum - discountedNum
  const savingsPercent = (savingsAmount / originalNum) * 100

  return {
    amount: formatMoney(savingsAmount, currency, locale),
    percent: `${savingsPercent.toFixed(0)}%`,
  }
}

/**
 * Safe comparison for decimal amounts
 * Accounts for floating point precision issues
 */
export function amountsEqual(
  a: Decimal | number | null,
  b: Decimal | number | null,
  tolerance: number = 0.01
): boolean {
  const numA = toNumber(a as any)
  const numB = toNumber(b as any)
  return Math.abs(numA - numB) < tolerance
}

/**
 * Convert between currencies (placeholder - implement with your exchange rate service)
 */
export function convertCurrency(
  amount: Decimal | number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRate: number
): Decimal {
  const amountDecimal =
    amount instanceof Decimal ? amount : new Decimal(amount)
  return amountDecimal
    .times(exchangeRate)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
}

/**
 * Validate that amounts in an order are consistent
 * Checks that total = subtotal + shipping + tax - discount
 */
export function validateOrderAmounts(order: {
  subtotal: Decimal | number
  shipping: Decimal | number
  tax?: Decimal | number
  discount?: Decimal | number
  total: Decimal | number
}): { valid: boolean; error?: string } {
  try {
    const expected = calculateOrderTotal(
      order.subtotal,
      order.shipping,
      order.tax || 0,
      order.discount || 0
    )
    const actual =
      order.total instanceof Decimal
        ? order.total
        : new Decimal(order.total)

    if (!amountsEqual(expected, actual)) {
      return {
        valid: false,
        error: `Total mismatch: expected ${expected}, got ${actual}`,
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

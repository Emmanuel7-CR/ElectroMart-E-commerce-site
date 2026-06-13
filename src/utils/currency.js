import { DEFAULT_CURRENCY, CURRENCIES } from './constants'

/**
 * Format a number as currency
 */
export function formatCurrency(amount, currencyCode = DEFAULT_CURRENCY) {
  const currency = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY]

  if (typeof amount !== 'number' || isNaN(amount)) return `${currency.symbol}0.00`

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Convert amount to smallest currency unit (kobo for NGN)
 */
export function toSmallestUnit(amount, currencyCode = DEFAULT_CURRENCY) {
  return Math.round(amount * 100)
}

/**
 * Convert from smallest unit back to base
 */
export function fromSmallestUnit(amount, currencyCode = DEFAULT_CURRENCY) {
  return amount / 100
}

/**
 * Calculate discount percentage
 */
export function discountPercent(originalPrice, salePrice) {
  if (!originalPrice || !salePrice || originalPrice <= salePrice) return 0
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
}

/**
 * Calculate order total with discount and shipping
 */
export function calculateOrderTotal({ subtotal, discountAmount = 0, shippingAmount = 0, taxAmount = 0 }) {
  return Math.max(0, subtotal - discountAmount + shippingAmount + taxAmount)
}

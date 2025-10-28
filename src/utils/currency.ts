/**
 * Currency formatting utilities
 */

import { useCurrency } from '@/context/currency-provider'

// Currency symbols configuration (expanded for common currencies)
const currencySymbols: Record<string, string> = {
  CAD: 'CA$',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  AUD: 'A$',
  CHF: 'CHF',
  NZD: 'NZ$',
  AED: 'AED',
  AFN: 'AFN',
  AMD: 'AMD',
  // Add more as needed
}

// Fallback exchange rates (used if API fails)
const fallbackRates: Record<string, number> = {
  CAD: 1.0,
  USD: 0.74,
  EUR: 0.68,
  GBP: 0.58,
}

/**
 * Format cents to currency string
 * @param cents - Amount in cents
 * @returns Formatted currency string (e.g., "$12.34")
 */
export const formatCurrency = (cents: number): string => {
  return `$${(cents / 100).toFixed(2)}`
}

/**
 * Convert amount from CAD cents to another currency using provided rates
 * @param cents - Amount in CAD cents
 * @param currency - Target currency code
 * @param rates - Exchange rates object (optional, uses fallback if not provided)
 * @returns Amount in target currency cents
 */
export const convertCurrency = (
  cents: number, 
  currency: string = 'CAD',
  rates?: Record<string, number>
): number => {
  const rateToUse = rates?.[currency] || fallbackRates[currency] || 1.0
  return Math.round(cents * rateToUse)
}

/**
 * Format cents to currency string with specific currency
 * @param cents - Amount in CAD cents
 * @param currency - Currency code (default: CAD)
 * @param rates - Exchange rates object (optional)
 * @returns Formatted currency string (e.g., "CA$12.34" or "$9.23" if converted)
 */
export const formatCurrencyWithSymbol = (
  cents: number, 
  currency: string = 'CAD',
  rates?: Record<string, number>
): string => {
  const symbol = currencySymbols[currency] || currency
  // Convert the amount based on exchange rate
  const convertedCents = convertCurrency(cents, currency, rates)
  const dollars = convertedCents / 100
  return `${symbol}${dollars.toFixed(2)}`
}

/**
 * Hook to format currency using the current currency from context
 * Automatically gets rates from the currency provider
 * @returns Function to format cents to currency string
 */
export const useCurrencyFormatter = () => {
  const { currency, rates } = useCurrency()
  // Pass rates from the provider to enable currency conversion
  return (cents: number) => formatCurrencyWithSymbol(cents, currency, rates)
}

/**
 * Parse currency string to cents
 * @param currency - Currency string (e.g., "$12.34" or "12.34")
 * @returns Amount in cents
 */
export const parseCurrencyToCents = (currency: string): number => {
  const cleaned = currency.replace(/[$,€£]/g, '')
  const amount = parseFloat(cleaned)
  return Math.round(amount * 100)
}

/**
 * Format date for display
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format date and time for display
 * @param dateString - ISO date string
 * @returns Formatted date and time string
 */
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Convert dollars string from backend to formatted currency
 * Backend sends amounts as strings in cents (e.g., "12500.00" means $125.00)
 * @param dollarString - Amount as string from backend (e.g., "12500.00")
 * @param currency - Currency code
 * @returns Formatted currency string (e.g., "₹125.00" or "$125.00")
 */
export const formatDollarsToCurrency = (dollarString: string, currency: string): string => {
  const symbol = currencySymbols[currency] || currency
  const amountInCents = parseFloat(dollarString)
  const amountInDollars = amountInCents / 100 // Convert cents to dollars
  return `${symbol}${amountInDollars.toFixed(2)}`
}

/**
 * Format currency amount for invoice display (without conversion)
 * Used when the invoice is stored in its native currency
 * @param amount - Amount in dollars (as string or number)
 * @param currency - Currency code
 * @returns Formatted currency string (e.g., "₹7826.25")
 */
export const formatInvoiceCurrency = (amount: string | number, currency: string): string => {
  const symbol = currencySymbols[currency] || currency
  const amountValue = typeof amount === 'string' ? parseFloat(amount) : amount
  return `${symbol}${amountValue.toFixed(2)}`
}

/**
 * Interface for historical exchange rates
 */
export interface ExchangeRates {
  rates: Record<string, number>;
  effectiveAt: number; // Unix timestamp
  baseCurrency: string;
}

/**
 * Hook to format invoice currency, checking if it needs conversion or direct display
 * @param invoiceCurrency - The currency the invoice is stored in
 * @param invoiceExchangeRateToCad - Optional exchange rate from invoice currency to CAD (deprecated)
 * @param historicalRates - Optional historical exchange rates from the invoice/transaction
 * @returns Function to format invoice amounts
 */
export const useInvoiceCurrencyFormatter = (
  invoiceCurrency: string, 
  invoiceExchangeRateToCad?: number,
  historicalRates?: ExchangeRates
) => {
  const { currency: displayCurrency, rates } = useCurrency()
  
  return (amount: string | number, fromCents: boolean = true) => {
    const amountValue = typeof amount === 'string' ? parseFloat(amount) : amount
    const amountInDollars = fromCents ? amountValue / 100 : amountValue
    
    // If invoice currency matches display currency, show directly
    if (invoiceCurrency === displayCurrency) {
      return formatInvoiceCurrency(amountInDollars, invoiceCurrency)
    }
    
    // Use historical rates if available (preferred method)
    if (historicalRates?.rates) {
      const fromRate = historicalRates.rates[invoiceCurrency] || 1
      const toRate = historicalRates.rates[displayCurrency]
      
      if (toRate) {
        // Convert using historical rates
        // formula: (amount / fromRate) * toRate
        const convertedAmount = (amountInDollars / fromRate) * toRate
        return formatInvoiceCurrency(convertedAmount, displayCurrency)
      }
    }
    
    // Fallback to old method: convert invoice currency -> CAD -> display currency
    if (rates && rates[displayCurrency]) {
      // Convert from invoice currency to CAD
      let amountInCAD: number
      
      if (invoiceExchangeRateToCad) {
        // We have the direct rate from invoice currency to CAD
        amountInCAD = amountInDollars * invoiceExchangeRateToCad
      } else if (invoiceCurrency === 'CAD') {
        // Already in CAD
        amountInCAD = amountInDollars
      } else {
        // Don't have the rate, just show in invoice currency
        return formatInvoiceCurrency(amountInDollars, invoiceCurrency)
      }
      
      // Convert from CAD to display currency
      const rateToDisplay = rates[displayCurrency]
      if (!rateToDisplay) {
        // Don't have the rate for display currency, just show in invoice currency
        return formatInvoiceCurrency(amountInDollars, invoiceCurrency)
      }
      const amountInDisplay = amountInCAD * rateToDisplay
      
      return formatInvoiceCurrency(amountInDisplay, displayCurrency)
    }
    
    // Fallback: show in invoice currency
    return formatInvoiceCurrency(amountInDollars, invoiceCurrency)
  }
}

import { createContext, useContext, useState, useMemo } from 'react'
import { getCookie, setCookie } from '@/lib/dashboardRelated/cookies'
import { useGetCurrencyRatesQuery } from '@/redux/apiSlices/Currency/currencySlice'

// Popular currencies to show in the switcher
export const POPULAR_CURRENCIES = ['CAD', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CNY', 'INR', 'CHF', 'NZD'] as const
export type PopularCurrency = typeof POPULAR_CURRENCIES[number]
export type Currency = string // Now supports any currency code from API

const DEFAULT_CURRENCY = 'CAD'

// Note: All amounts in the database are stored in CAD cents
// This switcher converts display values using exchange rates
const CURRENCY_COOKIE_NAME = 'vite-ui-currency'
const CURRENCY_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

type CurrencyProviderState = {
  currency: Currency
  setCurrency: (currency: Currency) => void
  rates?: Record<string, number>
  availableCurrencies: string[]
  isLoadingRates: boolean
  ratesError?: any
}

const initialState: CurrencyProviderState = {
  currency: DEFAULT_CURRENCY,
  setCurrency: () => null,
  availableCurrencies: [],
  isLoadingRates: false,
}

const CurrencyContext = createContext<CurrencyProviderState>(initialState)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, _setCurrency] = useState<Currency>(() => {
    const cookieCurrency = getCookie(CURRENCY_COOKIE_NAME) as Currency
    return cookieCurrency || DEFAULT_CURRENCY
  })

  // Only fetch exchange rates on user-facing pages (not dashboard)
  // Dashboard should always display in CAD
  const isDashboard = typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard')
  
  // Fetch exchange rates from backend only for customer pages
  const shouldSkip = isDashboard
  
  const { data: ratesData, isLoading: isLoadingRates, error: ratesError } = useGetCurrencyRatesQuery('CAD', {
    skip: shouldSkip // Skip on dashboard routes
  })

  // Extract available currencies from rates, sorted with popular ones first
  const availableCurrencies = useMemo(() => {
    if (!ratesData?.data?.rates) return []
    
    const rates = ratesData.data.rates
    const popular = POPULAR_CURRENCIES.filter(code => rates[code])
    const others = Object.keys(rates)
      .filter(code => !POPULAR_CURRENCIES.includes(code as any))
      .sort()
    
    return [...popular, ...others]
  }, [ratesData?.data?.rates])

  const setCurrency = (newCurrency: Currency) => {
    setCookie(CURRENCY_COOKIE_NAME, newCurrency, CURRENCY_COOKIE_MAX_AGE)
    _setCurrency(newCurrency)
  }

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency,
      rates: ratesData?.data?.rates,
      availableCurrencies,
      isLoadingRates,
      ratesError: ratesError as any,
    }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext)

  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider')

  return context
}


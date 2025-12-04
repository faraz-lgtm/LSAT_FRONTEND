import { createContext, useContext, useState, useMemo, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
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

// Map country codes to currency codes
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  // North America
  'US': 'USD',
  'CA': 'CAD',
  'MX': 'MXN',
  // Europe
  'GB': 'GBP',
  'IE': 'EUR',
  'FR': 'EUR',
  'DE': 'EUR',
  'ES': 'EUR',
  'IT': 'EUR',
  'NL': 'EUR',
  'BE': 'EUR',
  'AT': 'EUR',
  'PT': 'EUR',
  'GR': 'EUR',
  'FI': 'EUR',
  'LU': 'EUR',
  'CH': 'CHF',
  'NO': 'NOK',
  'SE': 'SEK',
  'DK': 'DKK',
  'PL': 'PLN',
  'CZ': 'CZK',
  'HU': 'HUF',
  // Asia Pacific
  'JP': 'JPY',
  'CN': 'CNY',
  'IN': 'INR',
  'AU': 'AUD',
  'NZ': 'NZD',
  'SG': 'SGD',
  'HK': 'HKD',
  'KR': 'KRW',
  'TW': 'TWD',
  'TH': 'THB',
  'MY': 'MYR',
  'ID': 'IDR',
  'PH': 'PHP',
  'VN': 'VND',
  'PK': 'PKR', // Pakistan
  // Middle East
  'AE': 'AED',
  'SA': 'SAR',
  'IL': 'ILS',
  // Other
  'BR': 'BRL',
  'ZA': 'ZAR',
  'RU': 'RUB',
  'TR': 'TRY',
}

/**
 * Detect user's currency based on browser locale and timezone
 * @returns Currency code or null if detection fails
 */
function detectCurrencyFromLocation(): string | null {
  if (typeof window === 'undefined') return null
  
  try {
    // Method 1: Use timezone to infer country (MOST RELIABLE - detects actual location)
    // Prioritize timezone over locale since locale can be misleading (e.g., en-US while in Pakistan)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    console.log('🌍 Currency Detection - Timezone:', timezone)
    
    if (timezone) {
      // Expanded timezone to currency mapping
      const timezoneToCurrency: Record<string, string> = {
        // US Timezones
        'America/New_York': 'USD',
        'America/Detroit': 'USD',
        'America/Kentucky/Louisville': 'USD',
        'America/Kentucky/Monticello': 'USD',
        'America/Indiana/Indianapolis': 'USD',
        'America/Indiana/Vincennes': 'USD',
        'America/Indiana/Winamac': 'USD',
        'America/Indiana/Marengo': 'USD',
        'America/Indiana/Petersburg': 'USD',
        'America/Indiana/Vevay': 'USD',
        'America/Indiana/Tell_City': 'USD',
        'America/Indiana/Knox': 'USD',
        'America/Menominee': 'USD',
        'America/North_Dakota/Center': 'USD',
        'America/North_Dakota/New_Salem': 'USD',
        'America/North_Dakota/Beulah': 'USD',
        'America/Chicago': 'USD',
        'America/Denver': 'USD',
        'America/Boise': 'USD',
        'America/Phoenix': 'USD',
        'America/Los_Angeles': 'USD',
        'America/Anchorage': 'USD',
        'America/Juneau': 'USD',
        'America/Sitka': 'USD',
        'America/Metlakatla': 'USD',
        'America/Yakutat': 'USD',
        'America/Nome': 'USD',
        'America/Adak': 'USD',
        'America/Honolulu': 'USD',
        // Canada Timezones
        'America/Toronto': 'CAD',
        'America/Montreal': 'CAD',
        'America/Vancouver': 'CAD',
        'America/Winnipeg': 'CAD',
        'America/Edmonton': 'CAD',
        'America/Regina': 'CAD',
        'America/Halifax': 'CAD',
        'America/St_Johns': 'CAD',
        'America/Yellowknife': 'CAD',
        'America/Whitehorse': 'CAD',
        'America/Dawson': 'CAD',
        'America/Iqaluit': 'CAD',
        'America/Inuvik': 'CAD',
        'America/Resolute': 'CAD',
        // Mexico
        'America/Mexico_City': 'MXN',
        'America/Cancun': 'MXN',
        'America/Merida': 'MXN',
        'America/Monterrey': 'MXN',
        'America/Mazatlan': 'MXN',
        // Europe
        'Europe/London': 'GBP',
        'Europe/Dublin': 'EUR',
        'Europe/Paris': 'EUR',
        'Europe/Berlin': 'EUR',
        'Europe/Rome': 'EUR',
        'Europe/Madrid': 'EUR',
        'Europe/Amsterdam': 'EUR',
        'Europe/Brussels': 'EUR',
        'Europe/Vienna': 'EUR',
        'Europe/Lisbon': 'EUR',
        'Europe/Athens': 'EUR',
        'Europe/Helsinki': 'EUR',
        'Europe/Luxembourg': 'EUR',
        'Europe/Monaco': 'EUR',
        'Europe/Malta': 'EUR',
        'Europe/Andorra': 'EUR',
        'Europe/San_Marino': 'EUR',
        'Europe/Vatican': 'EUR',
        'Europe/Zurich': 'CHF',
        'Europe/Oslo': 'NOK',
        'Europe/Stockholm': 'SEK',
        'Europe/Copenhagen': 'DKK',
        'Europe/Warsaw': 'PLN',
        'Europe/Prague': 'CZK',
        'Europe/Budapest': 'HUF',
        // Asia
        'Asia/Tokyo': 'JPY',
        'Asia/Shanghai': 'CNY',
        'Asia/Hong_Kong': 'HKD',
        'Asia/Singapore': 'SGD',
        'Asia/Kolkata': 'INR',
        'Asia/Seoul': 'KRW',
        'Asia/Taipei': 'TWD',
        'Asia/Bangkok': 'THB',
        'Asia/Kuala_Lumpur': 'MYR',
        'Asia/Jakarta': 'IDR',
        'Asia/Manila': 'PHP',
        'Asia/Ho_Chi_Minh': 'VND',
        'Asia/Karachi': 'PKR',
        'Asia/Islamabad': 'PKR',
        'Asia/Lahore': 'PKR',
        'Asia/Dubai': 'AED',
        'Asia/Riyadh': 'SAR',
        'Asia/Tel_Aviv': 'ILS',
        // Australia
        'Australia/Sydney': 'AUD',
        'Australia/Melbourne': 'AUD',
        'Australia/Brisbane': 'AUD',
        'Australia/Perth': 'AUD',
        'Australia/Adelaide': 'AUD',
        'Australia/Darwin': 'AUD',
        'Australia/Hobart': 'AUD',
        // New Zealand
        'Pacific/Auckland': 'NZD',
        'Pacific/Chatham': 'NZD',
      }
      
      if (timezoneToCurrency[timezone]) {
        console.log('✅ Currency detected from timezone:', timezoneToCurrency[timezone])
        return timezoneToCurrency[timezone]
      }
      
      // Extract country from timezone using better logic
      const tzParts = timezone.split('/')
      if (tzParts.length > 1 && tzParts[0]) {
        const region = tzParts[0]
        const city = tzParts[tzParts.length - 1]?.toLowerCase() || ''
        
        console.log('🌍 Currency Detection - Region:', region, 'City:', city)
        
        // More comprehensive region-based detection
        if (region === 'America') {
          if (city.includes('toronto') || city.includes('montreal') || city.includes('vancouver') || 
              city.includes('winnipeg') || city.includes('edmonton') || city.includes('regina') || 
              city.includes('halifax') || city.includes('yellowknife') || city.includes('whitehorse') ||
              city.includes('st_johns') || city.includes('iqaluit') || city.includes('resolute')) {
            console.log('✅ Currency detected: CAD from Canadian timezone')
            return 'CAD'
          }
          if (city.includes('mexico') || city.includes('cancun') || city.includes('merida') || 
              city.includes('monterrey') || city.includes('mazatlan')) {
            console.log('✅ Currency detected: MXN from Mexican timezone')
            return 'MXN'
          }
          // Default America to USD
          console.log('✅ Currency detected: USD from American timezone')
          return 'USD'
        }
        if (region === 'Europe') {
          if (city.includes('london')) {
            console.log('✅ Currency detected: GBP from UK timezone')
            return 'GBP'
          }
          if (city.includes('zurich')) {
            console.log('✅ Currency detected: CHF from Swiss timezone')
            return 'CHF'
          }
          if (city.includes('oslo')) {
            console.log('✅ Currency detected: NOK from Norwegian timezone')
            return 'NOK'
          }
          if (city.includes('stockholm')) {
            console.log('✅ Currency detected: SEK from Swedish timezone')
            return 'SEK'
          }
          if (city.includes('copenhagen')) {
            console.log('✅ Currency detected: DKK from Danish timezone')
            return 'DKK'
          }
          if (city.includes('warsaw')) {
            console.log('✅ Currency detected: PLN from Polish timezone')
            return 'PLN'
          }
          if (city.includes('prague')) {
            console.log('✅ Currency detected: CZK from Czech timezone')
            return 'CZK'
          }
          if (city.includes('budapest')) {
            console.log('✅ Currency detected: HUF from Hungarian timezone')
            return 'HUF'
          }
          // Default Europe to EUR
          console.log('✅ Currency detected: EUR from European timezone')
          return 'EUR'
        }
        if (region === 'Asia') {
          if (city.includes('tokyo')) {
            console.log('✅ Currency detected: JPY from Japanese timezone')
            return 'JPY'
          }
          if (city.includes('shanghai') || city.includes('beijing')) {
            console.log('✅ Currency detected: CNY from Chinese timezone')
            return 'CNY'
          }
          if (city.includes('hong_kong')) {
            console.log('✅ Currency detected: HKD from Hong Kong timezone')
            return 'HKD'
          }
          if (city.includes('singapore')) {
            console.log('✅ Currency detected: SGD from Singapore timezone')
            return 'SGD'
          }
          if (city.includes('kolkata') || city.includes('mumbai') || city.includes('delhi') || city.includes('bangalore')) {
            console.log('✅ Currency detected: INR from Indian timezone')
            return 'INR'
          }
          if (city.includes('seoul')) {
            console.log('✅ Currency detected: KRW from Korean timezone')
            return 'KRW'
          }
          if (city.includes('taipei')) {
            console.log('✅ Currency detected: TWD from Taiwanese timezone')
            return 'TWD'
          }
          if (city.includes('bangkok')) {
            console.log('✅ Currency detected: THB from Thai timezone')
            return 'THB'
          }
          if (city.includes('kuala_lumpur')) {
            console.log('✅ Currency detected: MYR from Malaysian timezone')
            return 'MYR'
          }
          if (city.includes('jakarta')) {
            console.log('✅ Currency detected: IDR from Indonesian timezone')
            return 'IDR'
          }
          if (city.includes('manila')) {
            console.log('✅ Currency detected: PHP from Philippine timezone')
            return 'PHP'
          }
          if (city.includes('ho_chi_minh') || city.includes('hanoi')) {
            console.log('✅ Currency detected: VND from Vietnamese timezone')
            return 'VND'
          }
          if (city.includes('dubai')) {
            console.log('✅ Currency detected: AED from UAE timezone')
            return 'AED'
          }
          if (city.includes('riyadh')) {
            console.log('✅ Currency detected: SAR from Saudi timezone')
            return 'SAR'
          }
          if (city.includes('tel_aviv')) {
            console.log('✅ Currency detected: ILS from Israeli timezone')
            return 'ILS'
          }
          if (city.includes('karachi') || city.includes('islamabad') || city.includes('lahore')) {
            console.log('✅ Currency detected: PKR from Pakistani timezone')
            return 'PKR'
          }
        }
        if (region === 'Australia') {
          console.log('✅ Currency detected: AUD from Australian timezone')
          return 'AUD'
        }
        if (region === 'Pacific') {
          if (city.includes('auckland') || city.includes('chatham')) {
            console.log('✅ Currency detected: NZD from New Zealand timezone')
            return 'NZD'
          }
        }
      }
    }
    
    // Method 2: Fallback to locale if timezone detection failed
    const locale = navigator.language || navigator.languages?.[0] || 'en-US'
    console.log('🌍 Currency Detection - Locale (fallback):', locale)
    const parts = locale.split('-')
    const countryCode = parts[1]?.toUpperCase()
    console.log('🌍 Currency Detection - Country Code from locale:', countryCode)
    
    if (countryCode && COUNTRY_TO_CURRENCY[countryCode]) {
      const detected = COUNTRY_TO_CURRENCY[countryCode]
      console.log('✅ Currency detected from locale (fallback):', detected)
      return detected
    }
    
    console.warn('⚠️ Currency detection failed - no timezone or locale match found')
    return null
  } catch (error) {
    console.warn('Failed to detect currency from location:', error)
    return null
  }
}

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
  const location = useLocation()
  
  // Check if we're on a dashboard route
  const isDashboard = location.pathname.startsWith('/dashboard')
  
  const [currency, _setCurrency] = useState<Currency>(() => {
    // Always use CAD for dashboard, regardless of cookie
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard')) {
      return DEFAULT_CURRENCY
    }
    
    // Check if user has already selected a currency (via cookie)
    const cookieCurrency = getCookie(CURRENCY_COOKIE_NAME) as Currency
    if (cookieCurrency) {
      return cookieCurrency
    }
    
    // Auto-detect currency based on user location
    const detectedCurrency = detectCurrencyFromLocation()
    if (detectedCurrency) {
      // Save the detected currency to cookie
      setCookie(CURRENCY_COOKIE_NAME, detectedCurrency, CURRENCY_COOKIE_MAX_AGE)
      return detectedCurrency
    }
    
    // Fallback to default
    return DEFAULT_CURRENCY
  })

  // Update currency when route changes
  useEffect(() => {
    if (isDashboard) {
      // Force CAD for dashboard
      _setCurrency(DEFAULT_CURRENCY)
    } else {
      // Use cookie value for non-dashboard routes
      const cookieCurrency = getCookie(CURRENCY_COOKIE_NAME) as Currency
      if (cookieCurrency) {
        _setCurrency(cookieCurrency)
      } else {
        // Auto-detect if no cookie exists
        const detectedCurrency = detectCurrencyFromLocation()
        if (detectedCurrency) {
          setCookie(CURRENCY_COOKIE_NAME, detectedCurrency, CURRENCY_COOKIE_MAX_AGE)
          _setCurrency(detectedCurrency)
        } else {
          _setCurrency(DEFAULT_CURRENCY)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  // Only fetch exchange rates on user-facing pages (not dashboard)
  // Dashboard should always display in CAD
  // Fetch exchange rates from backend only for customer pages
  // Skip currency exchange rates for free_purchase route since prices are 0
  const shouldSkip = isDashboard || location.pathname.includes('/free_purchase')
  
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
    // Don't allow currency changes on dashboard routes
    if (isDashboard) {
      return // Silently ignore currency changes on dashboard
    }
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


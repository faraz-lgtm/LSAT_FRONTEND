/**
 * Organization utility functions for multi-tenancy support
 * Supports both subdomain-based and header-based organization identification
 */

/**
 * Extract organization slug from subdomain
 * Examples:
 * - betterlsat.app.com -> betterlsat
 * - bettermcat.app.com -> bettermcat
 * - localhost:3000 -> null (no subdomain)
 * - api.betterlsat.com -> null (api subdomain, not organization)
 */
export function getOrganizationSlugFromSubdomain(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const hostname = window.location.hostname
    
    // Handle localhost and IP addresses
    if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return null
    }

    // Split hostname into parts
    const parts = hostname.split('.')
    
    // If we have at least 3 parts (e.g., betterlsat.app.com), the first is the subdomain
    // If we have 2 parts (e.g., betterlsat.com), the first is the domain (not subdomain)
    // We want to avoid treating 'api', 'www', 'app' as organization subdomains
    const ignoredSubdomains = ['api', 'www', 'app', 'admin', 'dashboard']
    
    if (parts.length >= 3 && parts[0]) {
      const subdomain = parts[0].toLowerCase()
      // Check if it's not an ignored subdomain
      if (!ignoredSubdomains.includes(subdomain)) {
        return subdomain
      }
    }
    
    return null
  } catch (error) {
    console.error('Error extracting organization from subdomain:', error)
    return null
  }
}

/**
 * Get organization slug from subdomain or Redux state
 * Priority: subdomain > Redux state > environment variable
 * 
 * @param organizationSlugFromState - Organization slug from Redux state (optional)
 * @returns Organization slug or null
 */
export function getOrganizationSlug(organizationSlugFromState?: string | null): string | null {
  // First, try subdomain-based detection
  const subdomainSlug = getOrganizationSlugFromSubdomain()
  if (subdomainSlug) {
    return subdomainSlug
  }

  // Fallback to Redux state
  if (organizationSlugFromState) {
    return organizationSlugFromState
  }

  // Last resort: environment variable (for development/testing)
  const envSlug = import.meta.env.VITE_ORGANIZATION_SLUG
  if (envSlug) {
    return envSlug
  }

  return null
}

/**
 * Check if we're using subdomain-based routing
 * @returns true if organization can be detected from subdomain
 */
export function isUsingSubdomainRouting(): boolean {
  return getOrganizationSlugFromSubdomain() !== null
}

/**
 * Check if current hostname matches an organization's domain
 * @returns true if hostname is a direct domain match (e.g., betterlsat.com)
 */
export function isOnOrganizationDomain(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const hostname = window.location.hostname
    
    // Handle localhost and IP addresses - these are not organization domains
    if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return false
    }

    // If hostname has 2 parts (e.g., betterlsat.com), it's likely an organization domain
    // If it has 3+ parts and first part is www, it might still be the domain (www.betterlsat.com)
    const parts = hostname.split('.')
    
    // www.betterlsat.com -> betterlsat.com (organization domain)
    if (parts.length >= 3 && parts[0] && parts[0].toLowerCase() === 'www') {
      return true
    }
    
    // betterlsat.com -> organization domain
    if (parts.length === 2) {
      return true
    }
    
    // If it's a subdomain that's not www, it's not the direct domain
    return false
  } catch (error) {
    console.error('Error checking organization domain:', error)
    return false
  }
}

/**
 * Get the domain from current hostname (without www)
 * @returns domain string or null
 */
export function getCurrentDomain(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const hostname = window.location.hostname
    
    // Handle localhost and IP addresses
    if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return null
    }

    const parts = hostname.split('.')
    
    // www.betterlsat.com -> betterlsat.com
    if (parts.length >= 3 && parts[0] && parts[0].toLowerCase() === 'www') {
      return parts.slice(1).join('.')
    }
    
    // betterlsat.com -> betterlsat.com
    if (parts.length === 2) {
      return hostname
    }
    
    return null
  } catch (error) {
    console.error('Error getting current domain:', error)
    return null
  }
}

/**
 * Extract organization slug from URL pathname
 * Examples:
 * - /betterlsat -> betterlsat
 * - /betterlsat/cart -> betterlsat
 * - /betterlsat/Appointment -> betterlsat
 * - /cart -> null (no slug)
 * @returns Organization slug or null
 */
export function getOrganizationSlugFromPathname(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const pathname = window.location.pathname
    
    // Extract slug from URL path (e.g., /betterlsat or /betterlsat/cart)
    const slugMatch = pathname.match(/^\/([^/]+)/)
    const slugFromPath = slugMatch && slugMatch[1] && 
      !['cart', 'Appointment', 'free_purchase', 'payment', 'success', 'cancel', 'reschedule', 'dashboard'].includes(slugMatch[1])
      ? slugMatch[1]
      : null
    
    return slugFromPath
  } catch (error) {
    console.error('Error extracting organization from pathname:', error)
    return null
  }
}

/**
 * Get organization slug with priority: pathname > subdomain > Redux state > env
 * This is the main function to use for getting the current organization slug
 * @param organizationSlugFromState - Organization slug from Redux state (optional)
 * @returns Organization slug or null
 */
export function getOrganizationSlugFromUrl(organizationSlugFromState?: string | null): string | null {
  // First, try pathname-based detection (for slug-based routing)
  const pathnameSlug = getOrganizationSlugFromPathname()
  if (pathnameSlug) {
    return pathnameSlug
  }

  // Then try subdomain-based detection
  const subdomainSlug = getOrganizationSlugFromSubdomain()
  if (subdomainSlug) {
    return subdomainSlug
  }

  // Fallback to Redux state
  if (organizationSlugFromState) {
    return organizationSlugFromState
  }

  // Last resort: environment variable (for development/testing)
  const envSlug = import.meta.env.VITE_ORGANIZATION_SLUG
  if (envSlug) {
    return envSlug
  }

  return null
}


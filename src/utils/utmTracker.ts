/**
 * UTM Parameter Tracking Utilities
 * Extracts and persists UTM parameters from URL
 */

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

const UTM_STORAGE_KEY = 'tracking_utm_params';
const UTM_EXPIRY_DAYS = 30; // Store UTM params for 30 days

interface StoredUTMParams extends UTMParams {
  timestamp: number;
}

/**
 * Extract UTM parameters from current URL
 */
export function extractUTMParamsFromURL(): UTMParams {
  if (typeof window === 'undefined') return {};

  const urlParams = new URLSearchParams(window.location.search);
  const utmParams: UTMParams = {};

  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  
  utmKeys.forEach((key) => {
    const value = urlParams.get(key);
    if (value) {
      utmParams[key as keyof UTMParams] = value;
    }
  });

  return utmParams;
}

/**
 * Get stored UTM parameters from localStorage
 */
export function getStoredUTMParams(): UTMParams {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem(UTM_STORAGE_KEY);
    if (!stored) return {};

    const parsed: StoredUTMParams = JSON.parse(stored);
    const now = Date.now();
    const expiryTime = parsed.timestamp + (UTM_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    // Check if stored params are still valid
    if (now > expiryTime) {
      localStorage.removeItem(UTM_STORAGE_KEY);
      return {};
    }

    // Return UTM params without timestamp
    const { timestamp, ...utmParams } = parsed;
    return utmParams;
  } catch (error) {
    console.error('Failed to retrieve stored UTM params:', error);
    return {};
  }
}

/**
 * Store UTM parameters in localStorage
 */
export function storeUTMParams(params: UTMParams): void {
  if (typeof window === 'undefined') return;

  try {
    // Merge with existing params (new params take precedence)
    const existing = getStoredUTMParams();
    const merged = { ...existing, ...params };

    // Only store if there are actual UTM params
    if (Object.keys(merged).length > 0) {
      const toStore: StoredUTMParams = {
        ...merged,
        timestamp: Date.now(),
      };
      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(toStore));
    }
  } catch (error) {
    console.error('Failed to store UTM params:', error);
  }
}

/**
 * Get current UTM parameters (from URL or storage)
 * Priority: URL params > Stored params
 */
export function getCurrentUTMParams(): UTMParams {
  const urlParams = extractUTMParamsFromURL();
  const storedParams = getStoredUTMParams();

  // URL params take precedence, but merge with stored for complete data
  return { ...storedParams, ...urlParams };
}

/**
 * Initialize UTM tracking - call on app load
 */
export function initializeUTMTracking(): UTMParams {
  const urlParams = extractUTMParamsFromURL();
  
  // If we have new UTM params in URL, store them
  if (Object.keys(urlParams).length > 0) {
    storeUTMParams(urlParams);
    return urlParams;
  }

  // Otherwise return stored params
  return getStoredUTMParams();
}

/**
 * Get referrer information
 */
export function getReferrer(): { referrer: string; referrer_domain?: string } {
  if (typeof window === 'undefined') {
    return { referrer: '' };
  }

  const referrer = document.referrer || '';
  let referrerDomain: string | undefined;

  if (referrer) {
    try {
      const url = new URL(referrer);
      referrerDomain = url.hostname;
    } catch (error) {
      // Invalid referrer URL, ignore
    }
  }

  return {
    referrer,
    referrer_domain: referrerDomain,
  };
}

/**
 * Build a URL path with UTM parameters preserved
 * @param path - The path to navigate to (e.g., "/betterlsat/cart" or "/cart")
 * @returns Path with UTM query parameters appended
 */
export function buildPathWithUTM(path: string): string {
  const utmParams = getCurrentUTMParams();
  
  // If no UTM params, return path as-is
  if (Object.keys(utmParams).length === 0) {
    return path;
  }
  
  // Build query string from UTM params
  const queryParams = new URLSearchParams();
  Object.entries(utmParams).forEach(([key, value]) => {
    if (value) {
      queryParams.append(key, value);
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `${path}?${queryString}` : path;
}


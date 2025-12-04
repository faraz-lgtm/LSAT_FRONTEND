/**
 * Tracking Configuration
 * Centralized configuration for all tracking tools
 */

export interface TrackingConfig {
  ga4: {
    enabled: boolean;
    measurementId: string | undefined;
  };
  fbPixel: {
    enabled: boolean;
    pixelId: string | undefined;
  };
  gtm: {
    enabled: boolean;
    containerId: string | undefined;
  };
  posthog: {
    enabled: boolean;
    key: string | undefined;
    host: string | undefined;
  };
}

/**
 * Get tracking configuration from environment variables
 */
export function getTrackingConfig(): TrackingConfig {
  const ga4MeasurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID;
  const fbPixelId = import.meta.env.VITE_FB_PIXEL_ID;
  const gtmContainerId = import.meta.env.VITE_GTM_CONTAINER_ID;
  // Support both VITE_POSTHOG_KEY and VITE_PUBLIC_POSTHOG_KEY
  const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY || import.meta.env.VITE_POSTHOG_KEY;
  const posthogHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';



  return {
    ga4: {
      enabled: Boolean(ga4MeasurementId),
      measurementId: ga4MeasurementId,
    },
    fbPixel: {
      enabled: Boolean(fbPixelId),
      pixelId: fbPixelId,
    },
    gtm: {
      enabled: Boolean(gtmContainerId),
      containerId: gtmContainerId,
    },
    posthog: {
      enabled: Boolean(posthogKey),
      key: posthogKey,
      host: posthogHost,
    },
  };
}

/**
 * Check if Do Not Track is enabled
 */
export function shouldRespectDoNotTrack(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check DNT header
  const dnt = window.navigator.doNotTrack || 
              (window.navigator as any).msDoNotTrack || 
              (window as any).doNotTrack;
  
  return dnt === '1' || dnt === 'yes';
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV;
}


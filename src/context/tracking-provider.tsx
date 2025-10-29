/**
 * Tracking Provider
 * Centralized tracking service that initializes and manages all tracking tools
 */

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { getTrackingConfig, shouldRespectDoNotTrack, isDevelopment } from '@/config/tracking';
import { initializeUTMTracking, getCurrentUTMParams } from '@/utils/utmTracker';
import { enrichEvent, sanitizeProperties } from '@/utils/eventHelpers';
import { initializeAutoTracking, trackPageView } from '@/utils/autoTracking';
import { setTrackingServiceForMiddleware } from '@/redux/trackingMiddleware';

export interface TrackingService {
  track: (eventName: string, properties?: Record<string, any>) => void;
  identify: (userId: string | number, traits?: Record<string, any>) => void;
  reset: () => void;
  page: (path?: string, properties?: Record<string, any>) => void;
}

interface TrackingContextValue {
  tracking: TrackingService;
  isInitialized: boolean;
}

const TrackingContext = createContext<TrackingContextValue | null>(null);

// Declare global functions for GA4, FB Pixel, and GTM
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: {
      (...args: any[]): void;
      q?: any[];
    };
    dataLayer?: any[];
  }
}

export function TrackingProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [posthog, setPosthog] = useState<any>(null);
  const configRef = useRef(getTrackingConfig());
  const location = useLocation();
  const authState = useSelector((state: RootState) => state.auth);

  // Initialize tracking on mount
  useEffect(() => {
    if (isInitialized) return;

    // Respect Do Not Track
    if (shouldRespectDoNotTrack()) {
      console.log('[Tracking] Do Not Track enabled, skipping tracking initialization');
      setIsInitialized(true);
      return;
    }

    const config = configRef.current;

    const initTracking = async () => {
      try {
        // Initialize UTM tracking
        initializeUTMTracking();

        // Initialize Google Analytics 4
        if (config.ga4.enabled && config.ga4.measurementId) {
          initializeGA4(config.ga4.measurementId);
        }

        // Initialize Facebook Pixel
        if (config.fbPixel.enabled && config.fbPixel.pixelId) {
          initializeFBPixel(config.fbPixel.pixelId);
        }

        // Initialize Google Tag Manager
        if (config.gtm.enabled && config.gtm.containerId) {
          initializeGTM(config.gtm.containerId);
        }

        // Initialize PostHog (dynamic import - only loads if enabled)
        if (config.posthog.enabled && config.posthog.key && config.posthog.host) {
          const posthogModule = await import('posthog-js');
          const ph = posthogModule.default;
          setPosthog(ph);
          initializePostHog(ph, config.posthog.key, config.posthog.host);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('[Tracking] Failed to initialize tracking:', error);
        setIsInitialized(true); // Set to true to prevent retries
      }
    };

    initTracking();
  }, [isInitialized]);

  // Create tracking service
  const trackingService = useMemo<TrackingService>(() => {
    const track: TrackingService['track'] = (eventName, properties = {}) => {
      if (!isInitialized) return;

      const config = configRef.current;
      const utmParams = getCurrentUTMParams();
      
      // Get user properties
      const userProperties: Record<string, any> = {};
      if (authState.user) {
        userProperties.user_id = authState.user.id;
        userProperties.username = authState.user.username;
        userProperties.user_roles = authState.user.roles;
      }

      // Enrich event
      const enriched = enrichEvent(
        { name: eventName, properties },
        utmParams,
        userProperties
      );

      // Sanitize properties
      const sanitizedProps = sanitizeProperties(enriched.properties);

      // Track in GA4
      if (config.ga4.enabled && window.gtag) {
        window.gtag('event', eventName, sanitizedProps);
      }

      // Track in Facebook Pixel
      if (config.fbPixel.enabled && window.fbq) {
        window.fbq('track', eventName, sanitizedProps);
      }

      // Track in PostHog (dynamic import)
      if (config.posthog.enabled && posthog && typeof posthog.capture === 'function') {
        posthog.capture(eventName, sanitizedProps);
      }

      // Track in GTM via dataLayer
      if (config.gtm.enabled && window.dataLayer) {
        window.dataLayer.push({
          event: eventName,
          ...sanitizedProps,
        });
      }

      // Debug logging in development
      if (isDevelopment()) {
        console.log(`[Tracking] Event: ${eventName}`, sanitizedProps);
      }
    };

    const identify: TrackingService['identify'] = (userId, traits = {}) => {
      if (!isInitialized) return;

      const config = configRef.current;
      const sanitizedTraits = sanitizeProperties(traits);

      // Identify in GA4
      if (config.ga4.enabled && window.gtag) {
        window.gtag('set', { user_id: String(userId), ...sanitizedTraits });
      }

      // Identify in PostHog (dynamic import)
      if (config.posthog.enabled && posthog && typeof posthog.identify === 'function') {
        posthog.identify(String(userId), sanitizedTraits);
      }

      // Identify in GTM
      if (config.gtm.enabled && window.dataLayer) {
        window.dataLayer.push({
          event: 'user_identify',
          user_id: String(userId),
          ...sanitizedTraits,
        });
      }

      if (isDevelopment()) {
        console.log(`[Tracking] Identify: ${userId}`, sanitizedTraits);
      }
    };

    const reset: TrackingService['reset'] = () => {
      if (!isInitialized) return;

      const config = configRef.current;

      // Reset PostHog (dynamic import)
      if (config.posthog.enabled && posthog && typeof posthog.reset === 'function') {
        posthog.reset();
      }

      // Reset GA4 (clear user_id)
      if (config.ga4.enabled && window.gtag) {
        window.gtag('set', { user_id: null });
      }

      if (isDevelopment()) {
        console.log('[Tracking] Reset');
      }
    };

    const page: TrackingService['page'] = (path, properties = {}) => {
      if (!isInitialized) return;

      const actualPath = path || location.pathname;
      track('page_view', {
        page_path: actualPath,
        page_title: document.title,
        ...properties,
      });
    };

    return { track, identify, reset, page };
  }, [isInitialized, location.pathname, authState.user, posthog]);

  // Inject tracking service into middleware
  useEffect(() => {
    if (isInitialized) {
      setTrackingServiceForMiddleware(trackingService);
      initializeAutoTracking(trackingService);
    }
  }, [isInitialized, trackingService]);

  // Identify user when auth state changes
  useEffect(() => {
    if (!isInitialized) return;

    if (authState.user && authState.isAuthenticated) {
      trackingService.identify(authState.user.id, {
        username: authState.user.username,
        roles: authState.user.roles,
      });
    } else {
      trackingService.reset();
    }
  }, [authState.user, authState.isAuthenticated, isInitialized, trackingService]);

  // Track page views on route changes
  useEffect(() => {
    if (!isInitialized) return;

    trackPageView(location.pathname);
    trackingService.page(location.pathname);
  }, [location.pathname, isInitialized, trackingService]);

  const value = useMemo(
    () => ({ tracking: trackingService, isInitialized }),
    [trackingService, isInitialized]
  );

  return <TrackingContext.Provider value={value}>{children}</TrackingContext.Provider>;
}

/**
 * Initialize Google Analytics 4
 */
function initializeGA4(measurementId: string): void {
  if (typeof window === 'undefined') return;

  // Load GA4 script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: any[]) {
    window.dataLayer!.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false, // We handle page views manually
  });

  if (isDevelopment()) {
    console.log('[Tracking] GA4 initialized:', measurementId);
  }
}

/**
 * Initialize Facebook Pixel
 */
function initializeFBPixel(pixelId: string): void {
  if (typeof window === 'undefined') return;

  // Facebook Pixel code
  window.fbq = window.fbq || function (...args: any[]) {
    (window.fbq!.q = window.fbq!.q || []).push(args);
  };

  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');

  // Load Facebook Pixel script
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  if (isDevelopment()) {
    console.log('[Tracking] Facebook Pixel initialized:', pixelId);
  }
}

/**
 * Initialize Google Tag Manager
 */
function initializeGTM(containerId: string): void {
  if (typeof window === 'undefined') return;

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js',
  });

  // Inject GTM script in head
  const gtmScript = document.createElement('script');
  gtmScript.async = true;
  gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`;
  document.head.appendChild(gtmScript);

  // Inject GTM noscript in body
  const noscript = document.createElement('noscript');
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.googletagmanager.com/ns.html?id=${containerId}`;
  iframe.height = '0';
  iframe.width = '0';
  iframe.style.display = 'none';
  iframe.style.visibility = 'hidden';
  noscript.appendChild(iframe);
  document.body.insertBefore(noscript, document.body.firstChild);

  if (isDevelopment()) {
    console.log('[Tracking] GTM initialized:', containerId);
  }
}

/**
 * Initialize PostHog (dynamic import)
 */
function initializePostHog(posthog: any, apiKey: string, host: string): void {
  if (typeof window === 'undefined') return;

  try {
    posthog.init(apiKey, {
      api_host: host,
      loaded: () => {
        if (isDevelopment()) {
          console.log('[Tracking] PostHog initialized:', apiKey);
        }
      },
      capture_pageview: false, // We handle page views manually
      capture_pageleave: true,
      autocapture: true, // Enable automatic event capture
    });
  } catch (error) {
    console.error('[Tracking] Failed to initialize PostHog:', error);
  }
}

/**
 * Hook to use tracking service
 */
export function useTracking(): TrackingService {
  const context = useContext(TrackingContext);
  if (!context) {
    // Return no-op functions if tracking is not available
    return {
      track: () => {},
      identify: () => {},
      reset: () => {},
      page: () => {},
    };
  }
  return context.tracking;
}


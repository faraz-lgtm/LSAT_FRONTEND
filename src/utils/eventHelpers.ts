/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Event Formatting Helpers
 * Utilities for formatting events consistently across tracking platforms
 */

/**
 * Event Formatting Helpers
 * Utilities for formatting events consistently across tracking platforms
 */
import type { UTMParams } from './utmTracker';
import { getReferrer } from './utmTracker';

export interface TrackingEvent {
  name: string;
  properties?: Record<string, any>;
}

export interface EnrichedTrackingEvent extends TrackingEvent {
  properties: Record<string, any>;
  timestamp?: number;
}

/**
 * Enrich event with UTM parameters and other context
 */
export function enrichEvent(
  event: TrackingEvent,
  utmParams?: UTMParams,
  userProperties?: Record<string, any>
): EnrichedTrackingEvent {
  const enriched: EnrichedTrackingEvent = {
    ...event,
    properties: {
      ...event.properties,
      timestamp: Date.now(),
      page_url: typeof window !== 'undefined' ? window.location.href : '',
      page_path: typeof window !== 'undefined' ? window.location.pathname : '',
      page_title: typeof document !== 'undefined' ? document.title : '',
      ...getReferrer(),
      ...utmParams,
      ...userProperties,
    },
  };

  return enriched;
}

/**
 * Format event name consistently (snake_case)
 */
export function formatEventName(name: string): string {
  return name
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_');
}

/**
 * Sanitize event properties (remove undefined, null values, limit string length)
 */
export function sanitizeProperties(properties: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(properties)) {
    // Skip undefined and null values
    if (value === undefined || value === null) {
      continue;
    }

    // Limit string length to 1000 characters
    if (typeof value === 'string' && value.length > 1000) {
      sanitized[key] = value.substring(0, 1000) + '...';
      continue;
    }

    // Recursively sanitize nested objects
    if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      sanitized[key] = sanitizeProperties(value);
      continue;
    }

    sanitized[key] = value;
  }

  return sanitized;
}

/**
 * Format e-commerce event for GA4
 */
export function formatGA4EcommerceEvent(
  eventName: string,
  items: Array<{
    item_id: string | number;
    item_name?: string;
    price?: number;
    quantity?: number;
  }>,
  value?: number,
  currency?: string
): Record<string, any> {
  return {
    event: eventName,
    ecommerce: {
      currency: currency || 'CAD',
      value: value || items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0),
      items: items.map((item) => ({
        item_id: String(item.item_id),
        item_name: item.item_name || '',
        price: item.price || 0,
        quantity: item.quantity || 1,
      })),
    },
  };
}

/**
 * Format e-commerce event for Facebook Pixel
 */
export function formatFBPixelEcommerceEvent(
  eventName: string,
  items: Array<{
    id: string | number;
    name?: string;
    price?: number;
    quantity?: number;
  }>,
  value?: number,
  currency?: string
): Record<string, any> {
  const contentIds = items.map((item) => String(item.id));
  const contents = items.map((item) => ({
    id: String(item.id),
    quantity: item.quantity || 1,
    item_price: item.price || 0,
  }));

  return {
    eventName,
    contentIds,
    contentName: items.map((item) => item.name || String(item.id)).join(', '),
    contents,
    currency: currency || 'CAD',
    value: value || items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0),
  };
}


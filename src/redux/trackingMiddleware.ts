/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Redux Middleware for Automatic Action Tracking
 * Tracks cart actions, auth changes, and other Redux state changes
 */

import type { Middleware } from '@reduxjs/toolkit';
import type { RootState } from './store';

// We'll inject the tracking service dynamically to avoid circular dependencies
let trackingService: { track: (event: string, properties?: Record<string, any>) => void } | null = null;

/**
 * Set the tracking service (called from TrackingProvider)
 */
export function setTrackingServiceForMiddleware(
  service: { track: (event: string, properties?: Record<string, any>) => void }
): void {
  trackingService = service;
}

/**
 * Redux middleware for tracking actions
 */
export const trackingMiddleware: Middleware<{}, RootState> = (store) => (next) => (action:any) => {
  const result = next(action);
  const state = store.getState();

  if (!trackingService) return result;

  // Track cart-related actions
  if (action.type?.startsWith('cart/')) {
    trackCartAction(action, state, trackingService);
  }

  // Track auth-related actions
  if (action.type?.startsWith('auth/')) {
    trackAuthAction(action, state, trackingService);
  }

  return result;
};

/**
 * Track cart actions
 */
function trackCartAction(
  action: any,
  state: RootState,
  service: { track: (event: string, properties?: Record<string, any>) => void }
): void {
  const { cart } = state;

  switch (action.type) {
    case 'cart/addToCartAsync/fulfilled':
      service.track('add_to_cart', {
        item_id: action.payload.id,
        item_name: action.payload.name || `Item ${action.payload.id}`,
        price: action.payload.price || 0,
        quantity: action.payload.quantity || 1,
        currency: 'CAD', // You can make this dynamic based on your currency context
        cart_total: cart.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0),
        cart_item_count: cart.items.length,
      });
      break;

    case 'cart/removeFromCart':
      const removedItem = cart.items.find((item) => item.id === action.payload);
      if (removedItem) {
        service.track('remove_from_cart', {
          item_id: removedItem.id,
          item_name: removedItem.name || `Item ${removedItem.id}`,
          price: removedItem.price || 0,
          quantity: removedItem.quantity || 1,
          currency: 'CAD',
        });
      }
      break;

    case 'cart/increaseQuantity':
    case 'cart/increaseQuantityAsync/fulfilled':
      const increasedItem = cart.items.find((item) => item.id === (action.payload?.itemId || action.payload));
      if (increasedItem) {
        service.track('add_to_cart', {
          item_id: increasedItem.id,
          item_name: increasedItem.name || `Item ${increasedItem.id}`,
          price: increasedItem.price || 0,
          quantity: 1, // Additional quantity added
          currency: 'CAD',
        });
      }
      break;

    case 'cart/decreaseQuantity':
      const decreasedItem = cart.items.find((item) => item.id === action.payload);
      if (decreasedItem && decreasedItem.quantity > 0) {
        service.track('remove_from_cart', {
          item_id: decreasedItem.id,
          item_name: decreasedItem.name || `Item ${decreasedItem.id}`,
          price: decreasedItem.price || 0,
          quantity: 1, // Quantity removed
          currency: 'CAD',
        });
      }
      break;

    case 'cart/clearCart':
      service.track('clear_cart', {
        cart_item_count: cart.items.length,
        cart_total: cart.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0),
      });
      break;
  }
}

/**
 * Track auth actions
 */
function trackAuthAction(
  action: any,
  state: RootState,
  service: { track: (event: string, properties?: Record<string, any>) => void }
): void {
  const { auth } = state;

  switch (action.type) {
    case 'auth/setUser':
      if (action.payload && auth.isAuthenticated) {
        // User logged in or user info updated
        service.track('login', {
          user_id: action.payload.id,
          username: action.payload.username,
          roles: action.payload.roles || [],
        });
      } else if (!action.payload) {
        // User logged out
        service.track('logout', {});
      }
      break;

    case 'auth/setTokens':
      if (auth.user && auth.isAuthenticated) {
        // User authenticated with tokens
        service.track('login', {
          user_id: auth.user.id,
          username: auth.user.username,
        });
      }
      break;

    case 'auth/reset':
      service.track('logout', {});
      break;
  }
}


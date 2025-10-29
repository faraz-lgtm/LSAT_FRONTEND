# Tracking Implementation Guide

This document describes the automated tracking system implemented in the application. The system automatically tracks user behavior, e-commerce events, and user journeys across multiple analytics platforms with minimal manual intervention.

## Overview

The tracking system integrates the following platforms:
- **Google Analytics 4 (GA4)** - Web analytics and e-commerce tracking
- **Facebook Pixel (Meta Pixel)** - Facebook/Meta ad tracking and conversion optimization
- **Google Tag Manager (GTM)** - Centralized tag management
- **PostHog** - Product analytics, feature flags, and user journey tracking

All tracking is automated - no manual event registration is required for standard user interactions.

## Setup Instructions

### 1. Obtain Tracking Credentials

Get the following credentials from your infrastructure/marketing team:

#### Google Analytics 4
- **Measurement ID**: Format `G-XXXXXXXXXX`
- **Location**: Google Analytics 4 Admin → Data Streams → Web Stream → Measurement ID

#### Facebook Pixel
- **Pixel ID**: 15-16 digit number
- **Location**: Facebook Events Manager → Data Sources → Pixel → Pixel ID

#### Google Tag Manager
- **Container ID**: Format `GTM-XXXXXXX`
- **Location**: Google Tag Manager → Admin → Container Settings → Container ID

#### PostHog
- **Project API Key**: Format `phc_xxxxxxxxxxxxx`
- **Host**: Usually `https://app.posthog.com` or `https://us.i.posthog.com`
- **Location**: PostHog Dashboard → Project Settings → Project API Key & Host

### 2. Configure Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Google Analytics 4
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# Facebook Pixel
VITE_FB_PIXEL_ID=XXXXXXXXXX

# Google Tag Manager
VITE_GTM_CONTAINER_ID=GTM-XXXXXXX

# PostHog (Cloud-hosted)
VITE_POSTHOG_KEY=phc_xxxxxxxxxxxxx
VITE_POSTHOG_HOST=https://app.posthog.com
```

**Note:** 
- All tools are conditionally loaded based on whether their environment variables are set
- You can enable/disable individual tracking tools by omitting their environment variables
- For production deployments, set these in your deployment platform's environment variable configuration

### 3. Restart Development Server

After adding environment variables, restart your development server:

```bash
npm run dev
```

## Automated Event Tracking

The system automatically tracks the following events:

### Page View Events
- **Event**: `page_view`
- **Triggered**: On all route changes (React Router and TanStack Router)
- **Properties**: `page_path`, `page_title`, `utm_*` parameters, referrer info

### E-commerce Events

#### Add to Cart
- **Event**: `add_to_cart`
- **Triggered**: Automatically when items are added to cart via Redux actions
- **Properties**: `item_id`, `item_name`, `price`, `quantity`, `currency`, `cart_total`, `cart_item_count`

#### Remove from Cart
- **Event**: `remove_from_cart`
- **Triggered**: Automatically when items are removed from cart
- **Properties**: `item_id`, `item_name`, `price`, `quantity`, `currency`

#### Begin Checkout
- **Event**: `begin_checkout`
- **Triggered**: When user views the cart page
- **Properties**: `currency`, `value`, `items`, `item_count`

#### Purchase
- **Event**: `purchase`
- **Triggered**: On payment success page
- **Properties**: `transaction_id`, `value`, `currency`, `items`, `item_count`

### User Authentication Events

#### Login
- **Event**: `login`
- **Triggered**: When user successfully authenticates
- **Properties**: `user_id`, `username`, `roles`

#### Logout
- **Event**: `logout`
- **Triggered**: When user logs out or session is reset

### User Interaction Events

#### Click
- **Event**: `click`
- **Triggered**: Automatically on button/link clicks
- **Properties**: `element_type`, `element_text`, `element_id`, `element_href`, `click_target`

#### Form Submit
- **Event**: `form_submit`
- **Triggered**: Automatically on form submissions
- **Properties**: `form_id`, `form_name`, `form_action`, `form_method`, `form_field_count`

### Page Visibility Events

#### Page Visible
- **Event**: `page_visible`
- **Triggered**: When page becomes visible after being hidden

#### Page Hidden
- **Event**: `page_hidden`
- **Triggered**: When page becomes hidden
- **Properties**: `time_on_page`

## UTM Parameter Tracking

UTM parameters are automatically captured and persisted:

- **Captured Parameters**: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
- **Persistence**: Stored in localStorage for 30 days
- **Attachment**: Automatically attached to all tracked events
- **Priority**: URL parameters take precedence over stored parameters

## User Identification

Users are automatically identified when:
- User logs in (Redux auth state changes)
- User information is available in the auth state

User properties tracked:
- `user_id`
- `username`
- `user_roles`

## Event Enrichment

All events are automatically enriched with:
- UTM parameters (if available)
- User properties (if authenticated)
- Page information (URL, path, title)
- Referrer information
- Timestamp

## Manual Event Tracking (Optional)

If you need to track custom events, use the `useTracking` hook:

```typescript
import { useTracking } from '@/context/tracking-provider';

function MyComponent() {
  const tracking = useTracking();

  const handleCustomAction = () => {
    tracking.track('custom_event_name', {
      property1: 'value1',
      property2: 'value2',
    });
  };

  return <button onClick={handleCustomAction}>Track Action</button>;
}
```

## Opting Out of Tracking

### For Users
The system respects the browser's "Do Not Track" (DNT) header. If enabled, no tracking scripts are loaded.

### For Developers

#### Skip Tracking on Specific Elements
Add `data-no-track` attribute to prevent automatic tracking:

```html
<button data-no-track onClick={handleClick}>
  Don't Track This
</button>
```

#### Skip Tracking on Forms
```html
<form data-no-track onSubmit={handleSubmit}>
  ...
</form>
```

## Debugging

In development mode, all tracking events are logged to the console with the prefix `[Tracking]`. Check the browser console to see:

- Event names and properties
- Tool initialization status
- Any tracking errors

Example console output:
```
[Tracking] GA4 initialized: G-XXXXXXXXXX
[Tracking] Facebook Pixel initialized: 123456789012345
[Tracking] Event: page_view { page_path: "/", page_title: "Home" }
```

## Privacy & Compliance

- **Do Not Track**: Fully respected - tracking is disabled if DNT header is present
- **GDPR**: Events are automatically sanitized (null/undefined values removed, string length limited)
- **Error Handling**: Tracking failures won't break the application

## Architecture

### Key Files

- `src/config/tracking.ts` - Configuration and feature flags
- `src/context/tracking-provider.tsx` - Main tracking service provider
- `src/utils/utmTracker.ts` - UTM parameter capture and persistence
- `src/utils/autoTracking.ts` - Automatic click/form/page tracking
- `src/utils/eventHelpers.ts` - Event formatting and sanitization
- `src/redux/trackingMiddleware.ts` - Redux middleware for action tracking

### Integration Points

- **Main App**: `src/main.tsx` - TrackingProvider wraps the entire app
- **Redux Store**: `src/redux/store.tsx` - Tracking middleware added
- **React Router**: Automatic page view tracking via `useLocation`
- **TanStack Router**: Page view tracking in `src/DashboardApp.tsx`

## Testing

In development, verify tracking is working by:

1. Check browser console for `[Tracking]` logs
2. Verify environment variables are loaded: `console.log(import.meta.env.VITE_GA4_MEASUREMENT_ID)`
3. Check browser Network tab for requests to tracking endpoints
4. Use browser extensions:
   - **GA4**: Google Analytics Debugger
   - **Facebook Pixel**: Facebook Pixel Helper
   - **GTM**: Tag Assistant

## Troubleshooting

### Tracking not working
1. Verify environment variables are set correctly
2. Check browser console for errors
3. Verify Do Not Track is not enabled
4. Check that tracking scripts are loading in Network tab

### Events not appearing in dashboards
1. Allow 24-48 hours for data to appear (some platforms have delays)
2. Verify event names match platform requirements
3. Check for ad blockers interfering with tracking
4. Verify tracking IDs are correct

### PostHog not initializing
1. Check that `VITE_POSTHOG_KEY` and `VITE_POSTHOG_HOST` are set
2. Verify the host URL is correct for your PostHog instance
3. Check browser console for PostHog-specific errors

## Support

For issues or questions:
1. Check browser console for error messages
2. Review this documentation
3. Contact your infrastructure/marketing team for tracking credential issues


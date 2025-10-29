/**
 * Automatic Event Tracking
 * Auto-captures clicks, form submissions, and other user interactions
 */

import type { TrackingService } from '../context/tracking-provider';

let trackingService: TrackingService | null = null;
let isInitialized = false;

/**
 * Initialize automatic tracking
 */
export function initializeAutoTracking(service: TrackingService): void {
  if (isInitialized) return;

  trackingService = service;
  isInitialized = true;

  // Setup click tracking
  setupClickTracking();

  // Setup form submission tracking
  setupFormTracking();

  // Setup page visibility tracking
  setupVisibilityTracking();
}

/**
 * Setup automatic click tracking using event delegation
 */
function setupClickTracking(): void {
  if (typeof document === 'undefined') return;

  document.addEventListener('click', (event) => {
    if (!trackingService) return;

    const target = event.target as HTMLElement;
    if (!target) return;

    // Get the interactive element (or its closest parent)
    const interactiveElement = target.closest('a, button, [role="button"], input[type="submit"], input[type="button"]');
    if (!interactiveElement) return;

    // Skip tracking if element has data-no-track attribute
    if (interactiveElement.hasAttribute('data-no-track')) return;

    // Get element details
    const elementType = interactiveElement.tagName.toLowerCase();
    const text = getElementText(interactiveElement);
    const href = (interactiveElement as HTMLAnchorElement).href || undefined;
    const id = interactiveElement.id || undefined;
    const className = interactiveElement.className || undefined;

    // Track click event
    trackingService?.track('click', {
      element_type: elementType,
      element_text: text,
      element_id: id,
      element_class: className,
      element_href: href,
      click_target: href || text || id || 'unknown',
    });
  }, true); // Use capture phase to catch all clicks
}

/**
 * Setup automatic form submission tracking
 */
function setupFormTracking(): void {
  if (typeof document === 'undefined') return;

  document.addEventListener('submit', (event) => {
    if (!trackingService) return;

    const form = event.target as HTMLFormElement;
    if (!form || form.tagName !== 'FORM') return;

    // Skip tracking if form has data-no-track attribute
    if (form.hasAttribute('data-no-track')) return;

    // Get form details
    const formId = form.id || undefined;
    const formName = form.name || undefined;
    const formAction = form.action || undefined;
    const formMethod = form.method || 'get';

    // Count form fields
    const inputCount = form.querySelectorAll('input, textarea, select').length;

    trackingService?.track('form_submit', {
      form_id: formId,
      form_name: formName,
      form_action: formAction,
      form_method: formMethod,
      form_field_count: inputCount,
    });
  }, true);
}

/**
 * Setup page visibility tracking
 */
function setupVisibilityTracking(): void {
  if (typeof document === 'undefined') return;

  let pageStartTime = Date.now();
  let isPageVisible = true;

  document.addEventListener('visibilitychange', () => {
    if (!trackingService) return;

    const isVisible = !document.hidden;

    if (isVisible && !isPageVisible) {
      // Page became visible
      const timeAway = Date.now() - (pageStartTime + (Date.now() - pageStartTime));
      trackingService.track('page_visible', {
        time_away: timeAway,
      });
      pageStartTime = Date.now();
    } else if (!isVisible && isPageVisible) {
      // Page became hidden
      const timeOnPage = Date.now() - pageStartTime;
      trackingService.track('page_hidden', {
        time_on_page: timeOnPage,
      });
    }

    isPageVisible = isVisible;
  });
}

/**
 * Get text content from element (with truncation)
 */
function getElementText(element: Element): string {
  const text = element.textContent || element.getAttribute('aria-label') || '';
  return text.trim().substring(0, 100); // Limit to 100 chars
}

/**
 * Track page view manually (called from router hooks)
 */
export function trackPageView(path: string, title?: string): void {
  if (!trackingService) return;

  trackingService.track('page_view', {
    page_path: path,
    page_title: title || document.title,
  });
}


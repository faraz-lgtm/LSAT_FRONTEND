/* eslint-disable @typescript-eslint/no-explicit-any */
// services/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { setTokens, setUser, setOrganization, reset } from "./authSlice";
import { ROLE } from "@/constants/roles";
import { toast } from 'sonner'

const BASE_URL = import.meta.env.VITE_SERVER_URL || (import.meta.env.DEV ? 'http://localhost:3000' : 'https://api.betterlsat.com');

// JWT decode utility
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

// Prevent multiple simultaneous refresh calls
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

// Type for refresh token response
interface RefreshTokenResponse {
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

// Custom base query with token refresh logic and error handling
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/v1`,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as any;
      const token = state.auth?.accessToken;
      const user = state.auth?.user;
      const organizationId = state.auth?.organizationId;
      
      // Only add Authorization header - organizationId is automatically extracted from JWT token by backend
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      
      // Add X-Organization-Id header for Super Admin in Dashboard only
      // This allows the backend to determine which organization the Super Admin is viewing
      // The backend will use this header to scope all GET, POST, PUT, PATCH requests to that organization
      // Only send this header on Dashboard routes, not on customer-facing routes
      if (user && organizationId && typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        const isDashboardRoute = pathname.startsWith('/dashboard');
        
        if (isDashboardRoute) {
          const isSuperAdmin = user.roles?.some((role: string) => 
            role === ROLE.SUPER_ADMIN || role === 'SUPER_ADMIN'
          ) || false;
          
          if (isSuperAdmin) {
            headers.set("X-Organization-Id", organizationId.toString());
          }
        }
      }
      
      // Extract organization slug from URL pathname and send in X-Organization-Slug header
      // This is sent with ALL API requests to help backend identify the organization context
      // Examples: /bettermcat → bettermcat, /bettermcat/cart → bettermcat
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        
        // Extract slug from URL path (e.g., /bettermcat or /bettermcat/cart → bettermcat)
        // Exclude known non-organization routes
        const slugMatch = pathname.match(/^\/([^/]+)/);
        const slugFromPath = slugMatch && slugMatch[1] && 
          !['cart', 'Appointment', 'free_purchase', 'payment', 'success', 'cancel', 'reschedule', 'dashboard'].includes(slugMatch[1])
          ? slugMatch[1]
          : null;
        
        // Send X-Organization-Slug header if we found a slug in the pathname
        if (slugFromPath) {
          headers.set("X-Organization-Slug", slugFromPath);
        }
      }
      
      return headers;
    },
  });

  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401 error, try to refresh the token
  // BUT NOT for login/auth endpoints (they should handle 401 errors themselves)
  if (result.error && result.error.status === 401) {
    const url = typeof args === 'string' ? args : args.url;
    const isAuthEndpoint = 
      url.includes('auth/login') || 
      url.includes('auth/register') ||
      url.includes('auth/forgot-password') ||
      url.includes('auth/verify-otp') ||
      url.includes('auth/reset-password');
    
    if (isAuthEndpoint) {
      console.log("🚫 Skipping token refresh for auth endpoint:", url);
      // Don't return early - let error fall through to error handling section to show toast
      // The error handling section below will handle showing the toast for auth endpoints
    } else {
      // Only attempt token refresh for non-auth endpoints
      const state = api.getState() as any;
      const { refreshToken } = state.auth;

      console.log("🔄 Token refresh triggered:", {
        hasRefreshToken: !!refreshToken,
        originalUrl: url,
        errorStatus: result.error?.status,
      });

      if (refreshToken) {
        // Prevent multiple simultaneous refresh calls
        if (isRefreshing && refreshPromise) {
          console.log("⏳ Waiting for existing refresh to complete...");
          try {
            await refreshPromise;
            // Retry original request with new token
            const retryResult = await baseQuery(args, api, extraOptions);
            // If retry succeeds, return early (no error, no toast)
            if (!retryResult.error) {
              return retryResult;
            }
            // If retry still fails, continue to error handling
            result = retryResult;
          } catch (error) {
            console.error("❌ Error waiting for existing refresh:", error);
            // Continue to error handling
          }
        } else {
          isRefreshing = true;
          refreshPromise = performTokenRefresh(refreshToken);

          try {
            const refreshResult = await refreshPromise;

            console.log("✅ Token refresh successful:", {
              newAccessToken: refreshResult?.data?.accessToken ? "present" : "missing",
              newRefreshToken: refreshResult?.data?.refreshToken ? "present" : "missing",
            });

            // Update tokens in store
            api.dispatch(
              setTokens({
                accessToken: refreshResult.data.accessToken,
                refreshToken: refreshResult.data.refreshToken,
              })
            );

            // Decode and update user data from new access token
            console.log("Decoding token", refreshResult.data.accessToken);
            const decodedToken = decodeJWT(refreshResult.data.accessToken);
            console.log("Decoded token", decodedToken);
            
            if (decodedToken) {
              const user = {
                id: decodedToken.sub?.toString() || "",
                username: decodedToken.username || "",
                roles: decodedToken.roles || [],
              };
              api.dispatch(setUser(user));
              
              // Extract and store organizationId from token if present
              if (decodedToken.organizationId) {
                const organizationId = Number(decodedToken.organizationId);
                // Keep existing organizationSlug if available, or set to null
                const currentOrgSlug = state.auth?.organizationSlug || null;
                api.dispatch(setOrganization({
                  organizationId,
                  organizationSlug: currentOrgSlug,
                }));
                console.log("🏢 Organization ID updated from token:", organizationId);
              }
              
              console.log("👤 User data updated from new token");
            }

            // Retry the original request with new token
            const retryResult = await baseQuery(args, api, extraOptions);
            
            // If retry succeeds, return early (no error, no toast)
            if (!retryResult.error) {
              console.log("🔄 Original request retried successfully");
              isRefreshing = false;
              refreshPromise = null;
              return retryResult;
            }
            
            // If retry still fails, continue to error handling
            console.log("⚠️ Retry after refresh still failed");
            result = retryResult;
          } catch (refreshError: any) {
            console.error("❌ Token refresh failed:", refreshError);

            if (refreshError?.status === 401 || refreshError?.status === 403) {
              console.log("🚪 Refresh token invalid (401/403), logging out user...");
              console.log("📝 Refresh error details:", {
                status: refreshError?.status,
                message: refreshError?.message,
                errorName: refreshError?.name || 'Unknown'
              });
              
              // Clear main app auth state
              api.dispatch(reset());
              
              // Clear Google Calendar tokens
              if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.removeItem('google_calendar_tokens');
              }
              
              // Redirect to sign-in (only in browser environment)
              // NO TOAST - we're logging out
              if (typeof window !== 'undefined') {
                window.location.href = "/dashboard/sign-in";
              }
              
              // Return early to prevent toast
              isRefreshing = false;
              refreshPromise = null;
              return result;
            } else {
              console.warn("⚠️ Token refresh failed due to network error");
              // Continue to error handling
            }
          } finally {
            isRefreshing = false;
            refreshPromise = null;
          }
        }
      } else {
        console.log("🚪 No refresh token available, logging out...");
        
        // Clear main app auth state
        api.dispatch(reset());
        
        // Clear Google Calendar tokens
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('google_calendar_tokens');
        }
        
        // Redirect to sign-in (only in browser environment)
        // NO TOAST - we're logging out
        if (typeof window !== 'undefined') {
          window.location.href = "/dashboard/sign-in";
        }
        
        // Return early to prevent toast
        return result;
      }
    }
  }

  // Handle different error types (after 401 handling)
  if (result.error) {
    console.log("🔄 Error:", result.error);
    const error = result.error as FetchBaseQueryError & { data?: any };
    
    // Extract error message from nested structure: { error: { message: "..." } }
    // API always returns errors in this format
    const extractErrorMessage = (errorData: any): string => {
      if (errorData?.error?.message) {
        return errorData.error.message;
      }
      if (errorData?.message) {
        return errorData.message;
      }
      return '';
    };
    
    const errorMessage = extractErrorMessage(error.data);
    
    // Create enhanced error with user-friendly messages
    const enhanceError = (status: number, defaultMessage: string) => {
      const extractedMessage = extractErrorMessage(error.data);
      return {
        ...error,
        data: {
          message: extractedMessage || defaultMessage,
          status,
          ...(error.data || {}),
        } as any
      } as FetchBaseQueryError;
    };

        // Handle 401 Unauthorized - only show toast for auth endpoints or other non-logout scenarios
        if (error.status === 401) {
          console.log("❌ Unauthorized (401):", error.data);
          const url = typeof args === 'string' ? args : args.url;
          const isAuthEndpoint = 
            url.includes('auth/login') || 
            url.includes('auth/register') ||
            url.includes('auth/forgot-password') ||
            url.includes('auth/verify-otp') ||
            url.includes('auth/reset-password');
          
          // Only show toast for auth endpoints (wrong credentials) or other 401 errors
          // Don't show toast if we're logging out (handled above)
          if (isAuthEndpoint || errorMessage) {
            console.error("❌ Unauthorized (401):", error.data);
            result.error = enhanceError(401, "Authentication failed. Please check your credentials.");
            toast.error(errorMessage || "Authentication failed. Please check your credentials.");
          }
          // If no error message and not auth endpoint, silently fail (likely logout scenario)
          return result;
        }

    // Handle 400 Bad Request
    if (error.status === 400) {
      if (errorMessage.includes('Organization') && errorMessage.includes('not found')) {
        console.error("❌ Organization not found (400):", error.data);
        result.error = enhanceError(400, "Organization not found or is inactive. Please contact support.");
        const enhancedErrorData = result.error.data as any;
        toast.error(enhancedErrorData?.message || "Organization not found or is inactive. Please contact support.");
      } else {
        console.error("❌ Bad Request (400):", error.data);
        result.error = enhanceError(400, "Invalid request. Please check your input.");
        // Show the actual error message if available, otherwise show default
        if (errorMessage) {
          toast.error(errorMessage);
        }
      }
    }
    
    // Handle 403 Forbidden
    else if (error.status === 403) {
      console.error("❌ Forbidden (403):", error.data);
      result.error = enhanceError(403, "You don't have permission to perform this action.");
      toast.error(errorMessage || "You don't have permission to perform this action.");
    }
    
    // Handle 404 Not Found
    else if (error.status === 404) {
      if (errorMessage.includes('Organization context required')) {
        console.error("❌ Organization context required (404):", error.data);
        result.error = enhanceError(404, "Organization context is required. Please ensure you're accessing the correct organization.");
        toast.error("Organization context is required. Please ensure you're accessing the correct organization.");
      } else {
        console.error("❌ Not Found (404):", error.data);
        result.error = enhanceError(404, "The requested resource was not found.");
        toast.error(errorMessage || "The requested resource was not found.");
      }
    }
    
    // Handle 500 Server Error
    else if (error.status === 500) {
      console.error("❌ Server Error (500):", error.data);
      result.error = enhanceError(500, "Server error occurred. Please try again later.");
      toast.error("Server error occurred. Please try again later.");
    }
    
    // Handle other server errors (502, 503, 504)
    else if (typeof error.status === 'number' && error.status >= 502 && error.status <= 504) {
      console.error(`❌ Server Error (${error.status}):`, error.data);
      result.error = enhanceError(error.status, "Service temporarily unavailable. Please try again later.");
      toast.error("Service temporarily unavailable. Please try again later.");
    }
    
    // Handle any other errors with messages
    else if (errorMessage) {
      toast.error(errorMessage);
    }
  }

  return result;
};

// Separate function for token refresh
async function performTokenRefresh(refreshToken: string): Promise<RefreshTokenResponse> {
  const response = await fetch(`${BASE_URL}/api/v1/auth/refresh-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    const error = new Error(`Refresh token failed: ${response.status}`) as any;
    error.status = response.status;
    error.name = 'RefreshTokenError';
    throw error;
  }

  const data = await response.json();
  return data;
}

// Base API configuration - NO endpoints defined here
export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Orders", "Users", "AvailableSlots", "Products", "Tasks", "Dashboard", "Invoices", "Refunds", "Transactions", "Currency", "Automation", "Chat", "Organization", "Calendar"],
  endpoints: () => ({}), // Empty - endpoints will be injected by slices
});
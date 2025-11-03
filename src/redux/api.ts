/* eslint-disable @typescript-eslint/no-explicit-any */
// services/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { setTokens, setUser, reset } from "./authSlice";

const BASE_URL = import.meta.env.VITE_SERVER_URL || (import.meta.env.DEV ? '' : 'https://api.betterlsat.com');

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
  // Custom fetch function to disable caching and prevent 304 responses
  const customFetch: typeof fetch = (input, init) => {
    const headers = new Headers(init?.headers);
    // Remove conditional request headers that cause 304 responses
    headers.delete('If-None-Match');
    headers.delete('If-Modified-Since');
    
    return fetch(input, {
      ...init,
      cache: 'no-store',
      headers,
    });
  };

  const baseQuery = fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/v1`,
    fetchFn: customFetch,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as any;
      const token = state.auth?.accessToken;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      // Prevent browser caching to avoid 304 responses
      headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
      headers.set("Pragma", "no-cache");
      headers.set("Expires", "0");
      return headers;
    },
  });

  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401 error, try to refresh the token
  // BUT NOT for login/auth endpoints (they should handle 401 errors themselves)
  if (result.error && result.error.status === 401) {
    const url = typeof args === 'string' ? args : args.url;
    const isAuthEndpoint = url.includes('auth/login') || url.includes('auth/register');
    
    if (isAuthEndpoint) {
      console.log("🚫 Skipping token refresh for auth endpoint:", url);
      return result; // Return the 401 error as-is for auth endpoints
    }

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
          return await baseQuery(args, api, extraOptions);
        } catch (error) {
          console.error("❌ Error waiting for existing refresh:", error);
          return result; // Return original error if refresh failed
        }
      }

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
          console.log("👤 User data updated from new token");
        }

        // Retry the original request with new token
        result = await baseQuery(args, api, extraOptions);

        console.log("🔄 Original request retried successfully");
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
          if (typeof window !== 'undefined') {
            window.location.href = "/dashboard/sign-in";
          }
        } else {
          console.warn("⚠️ Token refresh failed due to network error");
          // Don't throw, just return the original 401 error
        }
      } finally {
        isRefreshing = false;
        refreshPromise = null;
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
      if (typeof window !== 'undefined') {
        window.location.href = "/dashboard/sign-in";
      }
    }
  }

  // Handle different error types (after 401 handling)
  if (result.error) {
    const error = result.error as FetchBaseQueryError & { data?: any };
    
    // Create enhanced error with user-friendly messages
    const enhanceError = (status: number, defaultMessage: string) => {
      return {
        ...error,
        data: {
          message: error.data?.message || defaultMessage,
          status,
          ...(error.data || {})
        }
      } as FetchBaseQueryError;
    };

    // Handle 400 Bad Request
    if (error.status === 400) {
      console.error("❌ Bad Request (400):", error.data);
      result.error = enhanceError(400, "Invalid request. Please check your input.");
    }
    
    // Handle 403 Forbidden
    else if (error.status === 403) {
      console.error("❌ Forbidden (403):", error.data);
      result.error = enhanceError(403, "You don't have permission to perform this action.");
    }
    
    // Handle 404 Not Found
    else if (error.status === 404) {
      console.error("❌ Not Found (404):", error.data);
      result.error = enhanceError(404, "The requested resource was not found.");
    }
    
    // Handle 500 Server Error
    else if (error.status === 500) {
      console.error("❌ Server Error (500):", error.data);
      result.error = enhanceError(500, "Server error occurred. Please try again later.");
    }
    
    // Handle other server errors (502, 503, 504)
    else if (typeof error.status === 'number' && error.status >= 502 && error.status <= 504) {
      console.error(`❌ Server Error (${error.status}):`, error.data);
      result.error = enhanceError(error.status, "Service temporarily unavailable. Please try again later.");
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
  tagTypes: ["Orders", "Users", "AvailableSlots", "Products", "Tasks", "Dashboard", "Invoices", "Refunds", "Transactions", "Currency", "Automation", "Chat"],
  endpoints: () => ({}), // Empty - endpoints will be injected by slices
});
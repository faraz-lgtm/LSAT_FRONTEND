// services/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setTokens, setUser, reset } from "./authSlice";

const BASE_URL = import.meta.env.VITE_SERVER_URL;

// JWT decode utility
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

// Prevent multiple simultaneous refresh calls
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

// Custom base query with token refresh logic and error handling
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/v1`,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as any;
      const token = state.auth?.accessToken;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  })(args, api, extraOptions);

  // If we get a 401 error, try to refresh the token
  if (result.error && result.error.status === 401) {
    const state = api.getState() as any;
    const { refreshToken } = state.auth;

    console.log("🔄 Token refresh triggered:", {
      hasRefreshToken: !!refreshToken,
      originalUrl: args.url,
      errorStatus: result.error?.status,
    });

    if (refreshToken) {
      // Prevent multiple simultaneous refresh calls
      if (isRefreshing && refreshPromise) {
        console.log("⏳ Waiting for existing refresh to complete...");
        await refreshPromise;
        // Retry original request
        return await fetchBaseQuery({
          baseUrl: `${BASE_URL}/api/v1`,
          prepareHeaders: (headers, { getState }) => {
            const state = getState() as any;
            const token = state.auth?.accessToken;
            if (token) {
              headers.set("authorization", `Bearer ${token}`);
            }
            return headers;
          },
        })(args, api, extraOptions);
      }

      isRefreshing = true;
      refreshPromise = performTokenRefresh(refreshToken);

      try {
        const refreshResult = await refreshPromise;

        console.log("✅ Token refresh successful:", {
          newAccessToken: refreshResult?.data?.accessToken
            ? "present"
            : "missing",
          newRefreshToken: refreshResult?.data?.refreshToken
            ? "present"
            : "missing",
        });

        // Update tokens in store
        api.dispatch(
          setTokens({
            accessToken: refreshResult.data.accessToken,
            refreshToken: refreshResult.data.refreshToken,
          })
        );

        // Decode and update user data from new access token
        const decodedToken = decodeJWT(refreshResult.data.accessToken);
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
        result = await fetchBaseQuery({
          baseUrl: `${BASE_URL}/api/v1`,
          prepareHeaders: (headers, { getState }) => {
            const state = getState() as any;
            const token = state.auth?.accessToken;
            if (token) {
              headers.set("authorization", `Bearer ${token}`);
            }
            return headers;
          },
        })(args, api, extraOptions);

        console.log("🔄 Original request retried successfully");
      } catch (refreshError: any) {
        console.error("❌ Token refresh failed:", refreshError);

        if (refreshError?.status === 401 || refreshError?.status === 403) {
          console.log("🚪 Refresh token invalid (401/403), logging out user...");
          console.log("📝 Refresh error details:", {
            status: refreshError?.status,
            message: refreshError?.message,
            errorName: refreshError?.errorName || 'Unknown'
          });
          
          // Clear main app auth state
          api.dispatch(reset());
          
          // Clear Google Calendar tokens
          localStorage.removeItem('google_calendar_tokens');
          
          // Redirect to sign-in
          window.location.href = "/dashboard/sign-in";
        } else {
          console.warn("⚠️ Token refresh failed due to network error");
          throw refreshError;
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
      localStorage.removeItem('google_calendar_tokens');
      
      // Redirect to sign-in
      window.location.href = "/dashboard/sign-in";
    }
  }

  // Handle different error types (after 401 handling)
  if (result.error) {
    const error = result.error as any;
    
    // Handle 400 Bad Request
    if (error.status === 400) {
      console.error("❌ Bad Request (400):", error.data);
      // Transform error to include user-friendly message
      result.error = {
        ...error,
        data: {
          message: error.data?.message || "Invalid request. Please check your input.",
          status: 400,
          ...error.data
        }
      };
    }
    
    // Handle 403 Forbidden
    if (error.status === 403) {
      console.error("❌ Forbidden (403):", error.data);
      result.error = {
        ...error,
        data: {
          message: error.data?.message || "You don't have permission to perform this action.",
          status: 403,
          ...error.data
        }
      };
    }
    
    // Handle 404 Not Found
    if (error.status === 404) {
      console.error("❌ Not Found (404):", error.data);
      result.error = {
        ...error,
        data: {
          message: error.data?.message || "The requested resource was not found.",
          status: 404,
          ...error.data
        }
      };
    }
    
    // Handle 500 Server Error
    if (error.status === 500) {
      console.error("❌ Server Error (500):", error.data);
      result.error = {
        ...error,
        data: {
          message: error.data?.message || "Server error occurred. Please try again later.",
          status: 500,
          ...error.data
        }
      };
    }
    
    // Handle other server errors (502, 503, 504)
    if (error.status >= 502 && error.status <= 504) {
      console.error(`❌ Server Error (${error.status}):`, error.data);
      result.error = {
        ...error,
        data: {
          message: error.data?.message || "Service temporarily unavailable. Please try again later.",
          status: error.status,
          ...error.data
        }
      };
    }
  }

  return result;
};

// Separate function for token refresh
async function performTokenRefresh(refreshToken: string) {
  // Use direct fetch instead of RTK Query endpoint since it's not available yet
  const BASE_URL = import.meta.env.VITE_SERVER_URL;
  
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
    throw error;
  }

  return await response.json();
}

// Base API configuration - NO endpoints defined here
export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Orders", "Users"],
  endpoints: () => ({}), // Empty - endpoints will be injected by slices
});

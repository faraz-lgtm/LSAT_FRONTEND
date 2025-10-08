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

// Custom base query with token refresh logic
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
            role: decodedToken.roles || [],
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
          console.log("🚪 Refresh token invalid, logging out...");
          api.dispatch(reset());
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
      api.dispatch(reset());
      window.location.href = "/dashboard/sign-in";
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
    throw new Error(`Refresh token failed: ${response.status}`);
  }

  return await response.json();
}

// Base API configuration - NO endpoints defined here
export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Orders"],
  endpoints: () => ({}), // Empty - endpoints will be injected by slices
});

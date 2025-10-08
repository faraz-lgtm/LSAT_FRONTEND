import { api } from "@/redux/api";

// Types for auth endpoints
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  data: {
    auth: {
      accessToken: string;
      refreshToken: string;
    };
    user: {
      id: string;
      username: string;
      role: string[];
    };
  };
  meta: {};
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  data: {
    accessToken: string;
    refreshToken: string;
  };
  meta: {};
}

// Inject auth endpoints into the base API
export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    refreshToken: builder.mutation<RefreshTokenResponse, RefreshTokenRequest>({
      query: (body) => ({
        url: "auth/refresh-token", // ✅ Correct endpoint from user's specification
        method: "POST",
        body,
      }),
    }),
  }),
});

// Export hooks
export const { useLoginMutation, useRefreshTokenMutation } = authApi;

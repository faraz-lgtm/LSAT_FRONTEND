import { api } from "@/redux/api";
import type { BaseApiResponse } from "@/shared/BaseApiResponse";
import type { IUser } from "../User/userSlice";
import type { ROLE } from "@/constants/roles";

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
      role: ROLE[];
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

export interface IRegisterUserRequest {
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  roles: ROLE[];
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
    registerUser: builder.mutation<BaseApiResponse<IUser>, IRegisterUserRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Users'],
    })
  }),
});

// Export hooks
export const { useLoginMutation, useRefreshTokenMutation,useRegisterUserMutation } = authApi;

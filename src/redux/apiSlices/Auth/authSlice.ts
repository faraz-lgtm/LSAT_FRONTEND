/* eslint-disable @typescript-eslint/no-empty-object-type */
import { api } from "@/redux/api";
import type { BaseApiResponse } from "@/shared/BaseApiResponse";
// import type { UserOutput } from "../User/userSlice";
import type { AuthTokenOutput, LoginInput, LoginOutput, RefreshTokenInput, RegisterInput, UserOutput } from "@/types/api/data-contracts";

// Types for auth endpoints
// export interface LoginInput {
//   email: string;
//   password: string;
// }

// export interface LoginResponse {
//   data: {
//     auth: {
//       accessToken: string;
//       refreshToken: string;
//     };
//     user: {
//       id: number;
//       username: string;
//       roles: ROLE[];
//     };
//   };
//   meta: {};
// }

// export interface RefreshTokenInput {
//   refreshToken: string;
// }

// export interface RefreshTokenResponse {
//   data: {
//     accessToken: string;
//     refreshToken: string;
//   };
//   meta: {};
// }

// export interface RegisterInput {
//   name: string;
//   username: string;
//   email: string;
//   phone: string; // Reverted back to phone
//   password?: string; // Made optional for customer-only users
//   roles: ("USER" | "ADMIN" | "CUST")[];
//   workHours?: Record<string, string[]>; // Added workHours field
// }

// Inject auth endpoints into the base API
export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginOutput, LoginInput>({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    refreshToken: builder.mutation<AuthTokenOutput, RefreshTokenInput>({
      query: (body) => ({
        url: "auth/refresh-token", // ✅ Correct endpoint from user's specification
        method: "POST",
        body,
      }),
    }),
    registerUser: builder.mutation<BaseApiResponse<UserOutput>, RegisterInput>({
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

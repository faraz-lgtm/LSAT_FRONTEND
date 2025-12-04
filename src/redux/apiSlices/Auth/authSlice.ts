/* eslint-disable @typescript-eslint/no-empty-object-type */
import { api } from "@/redux/api";
import type { BaseApiResponse } from "@/shared/BaseApiResponse";
// import type { UserOutput } from "../User/userSlice";
import type { AuthTokenOutput, ForgotPasswordInput, ForgotPasswordOutput, LoginInput, LoginOutput, RefreshTokenInput, RegisterInput, ResetPasswordInput, ResetPasswordOutput, UserOutput, VerifyOtpInput, VerifyOtpOutput } from "@/types/api/data-contracts";

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
    login: builder.mutation<BaseApiResponse<LoginOutput>, LoginInput>({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    refreshToken: builder.mutation<BaseApiResponse<AuthTokenOutput>, RefreshTokenInput>({
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
    }),
    forgotPassword: builder.mutation<BaseApiResponse<ForgotPasswordOutput>, ForgotPasswordInput>({
      query: (body) => ({
        url: 'auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),
    verifyOtp: builder.mutation<BaseApiResponse<VerifyOtpOutput>, VerifyOtpInput>({
      query: (body) => ({
        url: 'auth/verify-otp',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation<BaseApiResponse<ResetPasswordOutput>, ResetPasswordInput>({
      query: (body) => ({
        url: 'auth/reset-password',
        method: 'POST',
        body,
      }),
    }),
  }),
});

// Export hooks
export const { useLoginMutation, useRefreshTokenMutation, useRegisterUserMutation, useForgotPasswordMutation, useVerifyOtpMutation, useResetPasswordMutation } = authApi;

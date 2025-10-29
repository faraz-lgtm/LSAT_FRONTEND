import { api } from "@/redux/api";
import type { BaseApiResponse } from "@/shared/BaseApiResponse";
import type { UpdateUserInput, UserOutput, UserInput, BaseUserOutput } from "@/types/api/data-contracts";

// Type definition for GetUsersQueryParams (not in API contracts yet)
export type GetUsersQueryParams = any;

// export interface UserOutput{
//     id: number;
//     name: string;
//     username: string;
//     roles: ("USER" | "ADMIN" | "CUST")[];
//     email: string;
//     phone: string;
//     isAccountDisabled: boolean;
//     workHours?: Record<string, string[]>;
//     createdAt: string;
//     updatedAt: string;
// }

// export interface UpdateUserInput {
//   name: string;
//   username: string;
//   email: string;
//   phone: string;
//   roles: ("USER" | "ADMIN" | "CUST")[];
//   workHours?: Record<string, string[]>;
//   isAccountDisabled?: boolean;
// }


export const usersApi=api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<BaseApiResponse<UserOutput[]>, GetUsersQueryParams | void>({
      query: (params) => ({
        url: '/users',
        params: params || {},
      }),
      providesTags: ['Users'],
    }),
    updateUser:builder.mutation<BaseApiResponse<UserOutput>,{id: number, userData: UpdateUserInput}>({
      query:({id, userData})=>({
        url: `/users/${id}`,
        method:'PATCH',
        body:userData
      }),
      invalidatesTags:['Users']
    }),
    
    deleteUser: builder.mutation<BaseApiResponse<{ message: string }>, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
    
    getOrCreateCustomer: builder.mutation<BaseApiResponse<BaseUserOutput>, UserInput>({
      query: (userData) => ({
        url: '/users/get-or-create-customer',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Users'],
    })
  }),
})

export const { useGetUsersQuery, useUpdateUserMutation, useDeleteUserMutation, useGetOrCreateCustomerMutation } = usersApi;
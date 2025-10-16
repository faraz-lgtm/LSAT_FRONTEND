import { api } from "@/redux/api";
import type { BaseApiResponse } from "@/shared/BaseApiResponse";
import type { UpdateUserInput, UserOutput } from "@/types/api/data-contracts";

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
    getUsers: builder.query<BaseApiResponse<UserOutput[]>, void>({
      query: () => '/users',
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
    })
  }),
})

export const { useGetUsersQuery, useUpdateUserMutation, useDeleteUserMutation } = usersApi;
import type { ROLE } from "@/constants/roles";
import { api } from "@/redux/api";
import type { BaseApiResponse } from "@/shared/BaseApiResponse";

export interface IUser{
    id: number;
    name: string;
    username: string;
    roles: ROLE[];
    email: string;
    phone: string;
    isAccountDisabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUpdateUser {
  name: string;
  username: string;
  email: string;
  phone: string;
  roles: ROLE[];
}


export const usersApi=api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<BaseApiResponse<IUser[]>, void>({
      query: () => '/users',
      providesTags: ['Users'],
    }),
    updateUser:builder.mutation<BaseApiResponse<IUser>,{id: number, userData: IUpdateUser}>({
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
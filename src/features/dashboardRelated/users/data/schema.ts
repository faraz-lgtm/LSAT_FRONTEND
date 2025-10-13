import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

const userRoleSchema = z.union([
  z.literal('ADMIN'),
  z.literal('USER'),
  z.literal('CUSTOMER'),
])

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string(),
  roles: z.array(userRoleSchema),
  email: z.string(),
  phoneNumber: z.string(),
  isAccountDisabled: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)

import { z } from 'zod'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

const userRoleSchema = z.union([
  z.literal('ADMIN'),
  z.literal('USER'),
  z.literal('CUST'),
])

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  roles: z.array(userRoleSchema),
  email: z.string(),
  phone: z.string(),
  isAccountDisabled: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)

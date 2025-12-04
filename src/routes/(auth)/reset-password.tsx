import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { ResetPassword } from '@/features/dashboardRelated/auth/reset-password'

const resetPasswordSearchSchema = z.object({
  identifier: z.string().optional(),
  otp: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/reset-password')({
  validateSearch: resetPasswordSearchSchema,
  component: ResetPassword,
})


import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Otp } from '@/features/dashboardRelated/auth/otp'

const otpSearchSchema = z.object({
  identifier: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/otp')({
  validateSearch: otpSearchSchema,
  component: Otp,
})

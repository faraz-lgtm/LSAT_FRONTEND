import { createFileRoute } from '@tanstack/react-router'
import { ComingSoon } from '@/components/dashboard/coming-soon'

export const Route = createFileRoute('/_authenticated/help-center/')({
  component: ComingSoon,
})

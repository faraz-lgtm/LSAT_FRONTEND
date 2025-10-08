import { createFileRoute } from '@tanstack/react-router'
import { Chats } from '@/features/dashboardRelated/chats'

export const Route = createFileRoute('/_authenticated/chats/')({
  component: Chats,
})

import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

// Lazy load ChatFlex to enable code splitting
const ChatFlex = lazy(() => import('@/features/dashboardRelated/chats/flex/ChatFlex').then(m => ({ default: m.ChatFlex })))

export const Route = createFileRoute('/_authenticated/chats/flex/')({
  component: ChatFlex,
})


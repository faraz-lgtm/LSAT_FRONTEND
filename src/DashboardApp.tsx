import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { useMemo } from 'react'

export default function DashboardApp() {
  const router = useMemo(
    () =>
      createRouter({
        routeTree,
        basepath: '/dashboard',          // keeps routes under /dashboard/*
        defaultPreload: 'intent',
        defaultPreloadStaleTime: 0,
      }),
    []
  )

  return <RouterProvider router={router} />
}

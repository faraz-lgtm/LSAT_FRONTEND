import { createFileRoute, redirect } from '@tanstack/react-router'
import { lazy, Suspense, useEffect } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux/store'
import { ROLE } from '@/constants/roles'
import { useNavigate } from '@tanstack/react-router'

// Lazy load dashboard to enable code splitting
const Dashboard = lazy(() => import('@/features/dashboardRelated/dashboard').then(m => ({ default: m.Dashboard })))

function DashboardWrapper() {
  const { user } = useSelector((state: RootState) => state.auth)
  const navigate = useNavigate()
  
  const isSuperAdmin = user?.roles?.includes(ROLE.SUPER_ADMIN) || (user?.roles as string[])?.includes('SUPER_ADMIN')
  
  useEffect(() => {
    if (user && isSuperAdmin) {
      navigate({ to: '/super-admin/dashboard' })
    }
  }, [user, isSuperAdmin, navigate])
  
  if (isSuperAdmin) {
    return null
  }
  
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading dashboard...</div>}>
      <Dashboard />
    </Suspense>
  )
}

export const Route = createFileRoute('/_authenticated/')({
  component: DashboardWrapper,
})

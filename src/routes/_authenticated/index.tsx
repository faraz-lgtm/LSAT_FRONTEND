import { createFileRoute, redirect } from '@tanstack/react-router'
import { lazy, Suspense, useEffect } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux/store'
import { ROLE } from '@/constants/roles'
import { useNavigate } from '@tanstack/react-router'

// Lazy load dashboard to enable code splitting
const Dashboard = lazy(() => import('@/features/dashboardRelated/dashboard').then(m => ({ default: m.Dashboard })))

function DashboardWrapper() {
  const { user, organizationId } = useSelector((state: RootState) => state.auth)
  const navigate = useNavigate()
  
  const isSuperAdmin = user?.roles?.includes(ROLE.SUPER_ADMIN) || (user?.roles as string[])?.includes('SUPER_ADMIN')
  
  useEffect(() => {
    // Only redirect to super-admin dashboard if no organization is selected
    if (user && isSuperAdmin && !organizationId) {
      navigate({ to: '/super-admin' })
    }
  }, [user, isSuperAdmin, organizationId, navigate])
  
  // If super admin but no organization selected, don't render (will redirect)
  if (isSuperAdmin && !organizationId) {
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

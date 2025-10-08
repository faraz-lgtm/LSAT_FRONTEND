import { useEffect } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux/store'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Preserve the current location for redirect after sign-in
      const currentPath = location.href
      navigate({
        to: '/dashboard/sign-in',
        search: { redirect: currentPath },
        replace: true,
      })
    }
  }, [isAuthenticated, user, navigate, location.href])

  // Show loading or nothing while redirecting
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return <>{children}</>
}

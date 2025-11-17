import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useGetMyOrganizationQuery, type OrganizationOutput } from '@/redux/apiSlices/Organization/organizationSlice'
import { setOrganization } from '@/redux/authSlice'
import type { RootState } from '@/redux/store'

interface UseOrganizationReturn {
  organization: OrganizationOutput | null
  loading: boolean
  error: any
}

/**
 * Hook to fetch and manage organization state
 * Automatically fetches organization on mount if authenticated
 * Updates Redux state with organization context
 */
export function useOrganization(): UseOrganizationReturn {
  const dispatch = useDispatch()
  const accessToken = useSelector((state: RootState) => state.auth.accessToken)
  const organizationId = useSelector((state: RootState) => state.auth.organizationId)
  const organizationSlug = useSelector((state: RootState) => state.auth.organizationSlug)
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)

  // Only fetch if authenticated and we don't have organization data yet
  const shouldFetch = isAuthenticated && accessToken && (!organizationId || !organizationSlug)

  const {
    data: organizationData,
    isLoading,
    error,
  } = useGetMyOrganizationQuery(undefined, {
    skip: !shouldFetch,
  })

  // Update Redux state when organization is fetched
  useEffect(() => {
    if (organizationData?.data) {
      const org = organizationData.data
      dispatch(
        setOrganization({
          organizationId: org.id,
          organizationSlug: org.slug,
        })
      )
    }
  }, [organizationData, dispatch])

  return {
    organization: organizationData?.data || null,
    loading: isLoading,
    error: error || null,
  }
}


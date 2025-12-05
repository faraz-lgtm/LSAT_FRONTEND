import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { getCookie, setCookie, removeCookie } from '@/lib/dashboardRelated/cookies'
import type { ROLE } from '@/constants/roles'

// Utility function to decode JWT token
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url?.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64!)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to decode JWT:', error)
    return null
  }
}

const ACCESS_TOKEN = 'accessToken'
const REFRESH_TOKEN = 'refreshToken'
const ORGANIZATION_ID = 'organizationId'
const ORGANIZATION_SLUG = 'organizationSlug'

export interface AuthUser {
  id: number;
  username: string
  roles: ROLE[]
}

interface AuthState {
  user: AuthUser | null
  accessToken: string
  refreshToken: string
  organizationId: number | null
  organizationSlug: string | null
  isAuthenticated: boolean
}

// Initialize state from cookies
const accessToken = getCookie(ACCESS_TOKEN) ? JSON.parse(getCookie(ACCESS_TOKEN)!) : ''
const refreshToken = getCookie(REFRESH_TOKEN) ? JSON.parse(getCookie(REFRESH_TOKEN)!) : ''
const organizationId = getCookie(ORGANIZATION_ID) ? Number(JSON.parse(getCookie(ORGANIZATION_ID)!)) : null
const organizationSlug = getCookie(ORGANIZATION_SLUG) ? JSON.parse(getCookie(ORGANIZATION_SLUG)!) : null

// Decode user info from access token if available
let user: AuthUser | null = null
let decodedOrganizationId: number | null = null
if (accessToken) {
  const decodedToken = decodeJWT(accessToken)
  if (decodedToken) {
    user = {
      id: Number(decodedToken.sub) || 0,
      username: decodedToken.username || '',
      roles: decodedToken.roles || []
    }
    // Extract organizationId from token if present
    decodedOrganizationId = decodedToken.organizationId ? Number(decodedToken.organizationId) : null
  }
}

// Use organizationId from token if available, otherwise use cookie
const finalOrganizationId = decodedOrganizationId || organizationId

const initialState: AuthState = {
  user,
  accessToken,
  refreshToken,
  organizationId: finalOrganizationId,
  organizationSlug,
  isAuthenticated: !!(accessToken && refreshToken && user), // Set to true if all exist
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload
      setCookie(ACCESS_TOKEN, JSON.stringify(action.payload))
    },
    setRefreshToken: (state, action: PayloadAction<string>) => {
      state.refreshToken = action.payload
      state.isAuthenticated = !!action.payload
      setCookie(REFRESH_TOKEN, JSON.stringify(action.payload))
    },
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.isAuthenticated = !!action.payload.refreshToken
      setCookie(ACCESS_TOKEN, JSON.stringify(action.payload.accessToken))
      setCookie(REFRESH_TOKEN, JSON.stringify(action.payload.refreshToken))
    },
    resetAccessToken: (state) => {
      state.accessToken = ''
      removeCookie(ACCESS_TOKEN)
    },
    resetRefreshToken: (state) => {
      state.refreshToken = ''
      removeCookie(REFRESH_TOKEN)
    },
    setOrganization: (state, action: PayloadAction<{ organizationId: number | null; organizationSlug: string | null }>) => {
      state.organizationId = action.payload.organizationId
      state.organizationSlug = action.payload.organizationSlug
      if (action.payload.organizationId !== null) {
        setCookie(ORGANIZATION_ID, JSON.stringify(action.payload.organizationId))
      } else {
        removeCookie(ORGANIZATION_ID)
      }
      if (action.payload.organizationSlug) {
        setCookie(ORGANIZATION_SLUG, JSON.stringify(action.payload.organizationSlug))
      } else {
        removeCookie(ORGANIZATION_SLUG)
      }
    },
    reset: (state) => {
      state.user = null
      state.accessToken = ''
      state.refreshToken = ''
      state.organizationId = null
      state.organizationSlug = null
      state.isAuthenticated = false
      removeCookie(ACCESS_TOKEN)
      removeCookie(REFRESH_TOKEN)
      removeCookie(ORGANIZATION_ID)
      removeCookie(ORGANIZATION_SLUG)
    },
  },
})

export const { 
  setUser, 
  setAccessToken, 
  setRefreshToken, 
  setTokens, 
  setOrganization,
  resetAccessToken, 
  resetRefreshToken, 
  reset 
} = authSlice.actions
export default authSlice.reducer

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { getCookie, setCookie, removeCookie } from '@/lib/dashboardRelated/cookies'
import type { ROLE } from '@/constants/roles'

// Utility function to decode JWT token
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    return null
  }
}

const ACCESS_TOKEN = 'accessToken'
const REFRESH_TOKEN = 'refreshToken'

export interface AuthUser {
  id: string
  username: string
  roles: ROLE[]
}

interface AuthState {
  user: AuthUser | null
  accessToken: string
  refreshToken: string
  isAuthenticated: boolean
}

// Initialize state from cookies
const accessToken = getCookie(ACCESS_TOKEN) ? JSON.parse(getCookie(ACCESS_TOKEN)!) : ''
const refreshToken = getCookie(REFRESH_TOKEN) ? JSON.parse(getCookie(REFRESH_TOKEN)!) : ''

// Decode user info from access token if available
let user: AuthUser | null = null
if (accessToken) {
  const decodedToken = decodeJWT(accessToken)
  if (decodedToken) {
    user = {
      id: decodedToken.sub?.toString() || '',
      username: decodedToken.username || '',
      roles: decodedToken.roles || []
    }
  }
}

const initialState: AuthState = {
  user,
  accessToken,
  refreshToken,
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
      setCookie(REFRESH_TOKEN, JSON.stringify(action.payload))
    },
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
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
    reset: (state) => {
      state.user = null
      state.accessToken = ''
      state.refreshToken = ''
      state.isAuthenticated = false
      removeCookie(ACCESS_TOKEN)
      removeCookie(REFRESH_TOKEN)
    },
  },
})

export const { 
  setUser, 
  setAccessToken, 
  setRefreshToken, 
  setTokens, 
  resetAccessToken, 
  resetRefreshToken, 
  reset 
} = authSlice.actions
export default authSlice.reducer

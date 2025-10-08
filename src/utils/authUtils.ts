import { store } from '@/redux/store'
import { reset } from '@/redux/authSlice'

// Utility function to manually logout user
export function logoutUser() {
  store.dispatch(reset())
  window.location.href = '/dashboard/sign-in'
}

// RTK Query error handler for 401 responses
// Note: This is now handled automatically by the base query in api.ts
// This function is kept for manual error handling if needed
export function handleApiError(error: any) {
  if (error?.status === 401) {
    // Token refresh is now handled automatically by RTK Query base query
    // This function can be used for additional error handling if needed
    console.warn('401 error detected - token refresh should be handled automatically')
  }
}

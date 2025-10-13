import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useGoogleCalendar } from '@/services/google-calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/dashboard/ui/calendarRelatedUI/ui/card'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

function GoogleCallback() {
  const navigate = useNavigate()
  const { authenticate, loading, error, isAuthenticated } = useGoogleCalendar()

  useEffect(() => {
    // Get the authorization code from URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')

    if (code && !isAuthenticated) {
      // Exchange the code for tokens
      authenticate(code)
        .then(() => {
          // Redirect to calendar page after successful authentication
          navigate({ to: '/calendar' })
        })
        .catch((err) => {
          console.error('Authentication failed:', err)
        })
    } else if (isAuthenticated) {
      // Already authenticated, redirect immediately
      navigate({ to: '/calendar' })
    }
  }, [authenticate, isAuthenticated, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              Processing Authentication
            </CardTitle>
            <CardDescription>
              Please wait while we connect your Google Calendar account...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
            <p className="text-sm text-center text-gray-600">
              Exchanging authorization code for access tokens...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <AlertCircle className="h-6 w-6 text-red-500" />
              Authentication Failed
            </CardTitle>
            <CardDescription>
              There was an error connecting to Google Calendar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-red-600">
              <p className="text-sm">{error}</p>
            </div>
            <div className="flex justify-center">
              <button 
                onClick={() => navigate({ to: '/calendar' })}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Back to Calendar
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Successfully Connected!
            </CardTitle>
            <CardDescription>
              Your Google Calendar has been connected successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-green-600">
              <p className="text-sm">Redirecting to calendar...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Google Calendar Authentication</CardTitle>
          <CardDescription>
            No authorization code found
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <button 
              onClick={() => navigate({ to: '/calendar' })}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Back to Calendar
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/auth/google/callback')({
  component: GoogleCallback,
})

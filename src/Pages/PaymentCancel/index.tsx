import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { XCircle, Home, CreditCard, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/dashboard/ui/badge'
import { Separator } from '@/components/dashboard/ui/separator'

interface CancelDetails {
  sessionId?: string
  reason?: string
  amount?: number
  currency?: string
}

export default function PaymentCancel() {
  const [searchParams] = useSearchParams()
  const [cancelDetails, setCancelDetails] = useState<CancelDetails>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Extract cancel details from URL parameters
    const sessionId = searchParams.get('session_id')
    const reason = searchParams.get('reason')
    const amount = searchParams.get('amount')
    const currency = searchParams.get('currency')

    setCancelDetails({
      sessionId: sessionId || undefined,
      reason: reason || 'Payment was cancelled',
      amount: amount ? parseFloat(amount) : undefined,
      currency: currency || 'usd'
    })

    setIsLoading(false)

    // Optional: Log cancellation for analytics
    if (sessionId) {
      console.log('Payment cancelled - Session ID:', sessionId)
    }
  }, [searchParams])

  const formatAmount = (amount?: number, currency?: string) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency?.toUpperCase() || 'USD'
    }).format(amount / 100) // Stripe amounts are in cents
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Cancel Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
              <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Payment Cancelled
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Your payment was cancelled. No charges have been made to your account.
            </p>
          </div>

          {/* Cancel Details Card */}
          <Card className="mb-6 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Details
              </CardTitle>
              <CardDescription>
                Your payment session was cancelled
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Amount
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {formatAmount(cancelDetails.amount, cancelDetails.currency)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                      CANCELLED
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Reason
                </label>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {cancelDetails.reason}
                </p>
              </div>

              {cancelDetails.sessionId && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Session ID
                  </label>
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {cancelDetails.sessionId}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Try Again
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      You can retry your payment by going back to the checkout page.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Check Your Payment Method
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ensure your payment method has sufficient funds and is valid.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Contact Support
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      If you continue to experience issues, our support team is here to help.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link to="/cart">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Link>
            </Button>
            
            <Button asChild variant="outline">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Support Information */}
          <div className="mt-8 text-center">
            <Separator className="mb-4" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Having trouble with your payment? Contact our support team at{' '}
              <a 
                href="mailto:support@betterlsatmcat.com" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                support@betterlsatmcat.com
              </a>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              No charges were made to your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, Home, Package, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/dashboard/ui/badge'
import { Separator } from '@/components/dashboard/ui/separator'

interface PaymentDetails {
  sessionId?: string
  customerEmail?: string
  amount?: number
  currency?: string
  status?: string
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Extract payment details from URL parameters
    const sessionId = searchParams.get('session_id')
    const customerEmail = searchParams.get('customer_email')
    const amount = searchParams.get('amount')
    const currency = searchParams.get('currency')
    const status = searchParams.get('status')

    setPaymentDetails({
      sessionId: sessionId || undefined,
      customerEmail: customerEmail || undefined,
      amount: amount ? parseFloat(amount) : undefined,
      currency: currency || 'usd',
      status: status || 'succeeded'
    })

    setIsLoading(false)

    // Optional: Send confirmation to backend
    if (sessionId) {
      // You can make an API call here to verify the payment on your backend
      console.log('Payment session ID:', sessionId)
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Payment Successful!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Thank you for your purchase. Your payment has been processed successfully.
            </p>
          </div>

          {/* Payment Details Card */}
          <Card className="mb-6 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Payment Details
              </CardTitle>
              <CardDescription>
                Your transaction has been completed successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Amount Paid
                  </label>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {formatAmount(paymentDetails.amount, paymentDetails.currency)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                      {paymentDetails.status?.toUpperCase() || 'SUCCESS'}
                    </Badge>
                  </div>
                </div>
              </div>

              {paymentDetails.customerEmail && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Email
                  </label>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {paymentDetails.customerEmail}
                  </p>
                </div>
              )}

              {paymentDetails.sessionId && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Transaction ID
                  </label>
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {paymentDetails.sessionId}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                What's Next?
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
                      Confirmation Email
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      You'll receive a confirmation email with your receipt and order details.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Schedule Your Sessions
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Our team will contact you to schedule your LSAT/MCAT preparation sessions.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Start Learning
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Begin your personalized LSAT/MCAT preparation journey with expert guidance.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center">
            <Button asChild variant="outline" className="px-8">
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
              Need help? Contact our support team at{' '}
              <a 
                href="mailto:support@betterlsatmcat.com" 
                className="text-green-600 dark:text-green-400 hover:underline"
              >
                support@betterlsatmcat.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"
/**
 * Success Page (OrderSuccessful)
 * ---------------------------------------------------------------------------
 * Simple, highly-commented page displayed after a successful authorization.
 * In production you'd verify the payment server-side before trusting success.
 *
 * Data flow (simplified):
 *  - Payrails SDK calls onAuthorizeSuccess with a response object.
 *  - Our hook redirects to /order/success?ref=<merchantReference>&pid=<paymentId?>
 *  - This page reads those query parameters and displays a friendly message.
 *
 * Styling borrows patterns from Tailwind UI Ecommerce examples: centered panel,
 * clear heading, call to action to view order or continue shopping.
 */
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function OrderSuccessPage() {
  const params = useSearchParams()
  const router = useRouter()
  const merchantRef = params.get('ref') || 'unknown-order'
  const paymentId = params.get('pid') || 'n/a'

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="relative mx-auto max-w-3xl w-full px-6 py-16 flex-1 flex flex-col justify-center">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Payment successful</h1>
          <p className="mt-4 text-sm text-gray-600">
            Thank you! Your payment was authorized. We are now preparing your order.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <dl className="divide-y divide-gray-200 text-sm">
            <div className="flex items-center justify-between py-3">
              <dt className="font-medium text-gray-700">Order reference</dt>
              <dd className="text-gray-900">{merchantRef}</dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="font-medium text-gray-700">Status</dt>
              <dd className="text-green-600 font-semibold">Authorized</dd>
            </div>
          </dl>
        </div>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Back to checkout demo
          </Link>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-xs hover:bg-gray-50"
          >
            Continue shopping
          </button>
        </div>
        <p className="mt-8 text-xs text-gray-400 text-center">
          (For tutorial purposes only. Always verify the payment on your server before fulfilling orders.)
        </p>
      </div>
    </div>
  )
}

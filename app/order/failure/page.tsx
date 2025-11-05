"use client"
/**
 * Failure Page (OrderFailure)
 * ---------------------------------------------------------------------------
 * Displayed when authorization fails. Shows basic troubleshooting text.
 *
 * Data flow:
 *  - Hook redirects to /order/failure?ref=<merchantReference>&reason=<encodedReason>
 *  - This page decodes and renders the reason providing user‑facing messaging.
 */
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function OrderFailurePage() {
  const params = useSearchParams()
  const merchantRef = params.get('ref') || 'unknown-order'
  const reason = params.get('reason') || 'Authorization declined.'

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="relative mx-auto max-w-3xl w-full px-6 py-16 flex-1 flex flex-col justify-center">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Payment failed</h1>
          <p className="mt-4 text-sm text-gray-600">
            We couldn&apos;t authorize your payment. Please review the details below and try again.
          </p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <dl className="divide-y divide-red-200 text-sm">
            <div className="flex items-center justify-between py-3">
              <dt className="font-medium text-red-700">Order reference</dt>
              <dd className="text-red-900">{merchantRef}</dd>
            </div>
            <div className="flex items-start justify-between py-3">
              <dt className="font-medium text-red-700">Failure reason</dt>
              <dd className="text-red-900 max-w-xs text-right">{decodeURIComponent(reason)}</dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="font-medium text-red-700">Status</dt>
              <dd className="text-red-600 font-semibold">Not authorized</dd>
            </div>
          </dl>
        </div>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Try again
          </Link>
          <Link
            href="/"
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-xs hover:bg-gray-50"
          >
            Return home
          </Link>
        </div>
        <p className="mt-8 text-xs text-gray-400 text-center">
          (Tutorial only – investigate declined payments server-side for real causes.)
        </p>
      </div>
    </div>
  )
}

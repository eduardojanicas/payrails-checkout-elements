"use client"
/**
 * PayPalPlaceholder
 * ---------------------------------------------------------------------------
 * Temporary placeholder while PayPal element integration is pending. Mirrors
 * layout behavior of the card container (kept mounted, hidden via CSS).
 */
import React from 'react'

export const PayPalPlaceholder: React.FC = () => {
  return (
    <div
      id="paypal-placeholder"
      className="rounded-md border border-dashed border-gray-300 p-4 text-sm text-gray-500"
      aria-live="polite"
    >
      {/* STEP 1c: PayPal placeholder component (renders only when selected) */}
      {'PayPal element coming soon…'}
    </div>
  )
}

export default PayPalPlaceholder

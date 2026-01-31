"use client"
/**
 * ExpressCheckoutButtonContainer
 * ---------------------------------------------------------------------------
 * Wraps express checkout buttons (Apple Pay, Google Pay, PayPal) from Payrails.
 * Positioned above the regular payment method selector for quick checkout options.
 *
 */
import React from 'react'
import Spinner from './Spinner'

export type ExpressCheckoutStatus = 'idle' | 'loading' | 'ready' | 'error'

type MountRef = React.RefObject<HTMLDivElement> | ((node: HTMLDivElement | null) => void)

interface ExpressCheckoutButtonContainerProps {
  status: ExpressCheckoutStatus
  error?: string | null
  mountApplePayRef: MountRef
  mountGooglePayRef: MountRef
  mountPayPalRef: MountRef
}

export const ExpressCheckoutButtonContainer: React.FC<ExpressCheckoutButtonContainerProps> = ({
  status,
  error,
  mountApplePayRef,
  mountGooglePayRef,
  mountPayPalRef,
}) => {
  return (
    <div className="m-1 mt-4">
      {/* Loading/Error states */}
      {status === 'loading' && <Spinner label="Loading express checkout" />}
      {status === 'idle' && <Spinner label="Preparing express checkout" size="sm" />}
      {status === 'error' && (
        <p className="text-sm text-red-600">
          Failed to load express checkout.{error ? ` (${error})` : ''}
        </p>
      )}

      {/* Express checkout buttons grid */}
      <div className="flex flex-col gap-3 mt-8">
        {/* Apple Pay Button Container */}
        <div
          id="apple-pay-button-container"
          ref={mountApplePayRef}
          className="rounded-md [&>*]:w-full [&>*]:h-11"
          aria-label="Apple Pay"
        />

        {/* Google Pay Button Container */}
        <div
          id="google-pay-button-container"
          ref={mountGooglePayRef}
          className="rounded-md [&>*]:w-full [&>*]:h-11"
          aria-label="Google Pay"
        />

        {/* PayPal Button Container */}
        <div
          id="paypal-button-container"
          ref={mountPayPalRef}
          className="rounded-md [&>*]:w-full [&>*]:h-11"
          aria-label="PayPal"
        />
      </div>
    </div>
  )
}

export default ExpressCheckoutButtonContainer

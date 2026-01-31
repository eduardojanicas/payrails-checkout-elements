"use client"
/**
 * PaymentButton
 * ---------------------------------------------------------------------------
 * Hosts the Payrails payment button element mount point. Applies disabled styling
 * and aria-disabled when prerequisites (form + SDK readiness) are not met.
 */
import React from 'react'

interface PaymentButtonProps {
  mountRef: React.RefObject<HTMLDivElement> | ((node: HTMLDivElement | null) => void)
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({ mountRef }) => {
  return (
    <div className="mt-2 flex justify-end">
      {/* STEP 1e: Payment button container component */}
      <div
        id="payment-button-container"
        ref={mountRef}
        className={
          'w-full flex justify-end relative '
        }
      >
        {/* Payrails payment button element will mount here */}
      </div>
    </div>
  )
}

export default PaymentButton

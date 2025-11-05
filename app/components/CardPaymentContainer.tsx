"use client"
/**
 * CardPaymentContainer
 * ---------------------------------------------------------------------------
 * Wraps the Payrails card form element mount target. Stays mounted (hidden when
 * not selected) to avoid remount churn. Shows simple status messaging/spinners.
 */
import React from 'react'
import Spinner from './Spinner'

export type CardContainerStatus = 'idle' | 'loading' | 'ready' | 'error'

type MountRef = React.RefObject<HTMLDivElement> | ((node: HTMLDivElement | null) => void)

interface CardPaymentContainerProps {
  status: CardContainerStatus
  error?: string | null
  mountRef: MountRef
}

export const CardPaymentContainer: React.FC<CardPaymentContainerProps> = ({ status, error, mountRef }) => {
  return (
    <div
      id="card-form-container"
      ref={mountRef}
      className="rounded-md border border-gray-300 p-4"
      aria-live="polite"
    >
      {/* STEP 1b: Card payment container component (renders only when selected) */}
      {status === 'loading' && <Spinner label="Loading payment" />}
      {status === 'idle' && <Spinner label="Preparing SDK" size="sm" />}
      {status === 'error' && (
        <p className="text-sm text-red-600">Failed to load payment.{error ? ` (${error})` : ''}</p>
      )}
      {/* Payment element mounts here when status transitions to ready */}
    </div>
  )
}

export default CardPaymentContainer

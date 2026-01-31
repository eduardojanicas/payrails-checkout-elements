"use client"
/**
 * PaymentDetails
 * ---------------------------------------------------------------------------
 * Wraps payment method selection and the dynamic payment containers. Acts as a
 * focused unit for payment UI concerns.
 */
import React from 'react'
import CardPaymentContainer from './CardPaymentContainer'

import type { CardContainerStatus } from './CardPaymentContainer'

interface PaymentDetailsProps<M extends string> {
  status: CardContainerStatus
  error: string | null
  mountDropInRef: React.RefObject<HTMLDivElement> | ((node: HTMLDivElement | null) => void)
}

export const PaymentDetails = <M extends string>({
  status,
  error,
  mountDropInRef,
}: PaymentDetailsProps<M>) => {
  return (
    <div className="mt-2">
      <CardPaymentContainer status={status} error={error} mountRef={mountDropInRef} />
    </div>
  )
}

export default PaymentDetails

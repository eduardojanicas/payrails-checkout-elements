"use client"
/**
 * PaymentDetails
 * ---------------------------------------------------------------------------
 * Wraps payment method selection and the dynamic payment containers. Acts as a
 * focused unit for payment UI concerns.
 */
import React from 'react'
import PaymentMethodSelector from './PaymentMethodSelector'
import CardPaymentContainer from './CardPaymentContainer'
import { Placeholder } from './Placeholder'

import type { CardContainerStatus } from './CardPaymentContainer'
import type { PaymentMethodOption } from './PaymentMethodSelector'

interface PaymentDetailsProps<M extends string> {
  paymentMethods: PaymentMethodOption<M>[]
  paymentMethod: M
  onSelect: (m: M) => void
  status: CardContainerStatus
  error: string | null
  mountCardFormRef: React.RefObject<HTMLDivElement> | ((node: HTMLDivElement | null) => void)
}

export const PaymentDetails = <M extends string>({
  paymentMethods,
  paymentMethod,
  onSelect,
  status,
  error,
  mountCardFormRef,
}: PaymentDetailsProps<M>) => {
  return (
    <div className="">
      {/* STEP 1: Payment details wrapper component */}
      <PaymentMethodSelector methods={paymentMethods} value={paymentMethod} onChange={onSelect} />
      <div className="space-y-4">
        {paymentMethod === 'card' && (
          <CardPaymentContainer status={status} error={error} mountRef={mountCardFormRef} />
        )}
        {(paymentMethod === 'pix' || paymentMethod === 'upi') && <Placeholder />}
      </div>
    </div>
  )
}

export default PaymentDetails

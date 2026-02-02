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
import PixElement from './PixElement'
import EasypaisaElement from './EasypaisaElement'

import type { CardContainerStatus } from './CardPaymentContainer'
import type { PixElementStatus } from './PixElement'
import type { EasypaisaElementStatus } from './EasypaisaElement'
import type { PaymentMethodOption } from './PaymentMethodSelector'

interface PaymentDetailsProps<M extends string> {
  paymentMethods: PaymentMethodOption<M>[]
  paymentMethod: M
  onSelect: (m: M) => void
  status: CardContainerStatus
  pixStatus: PixElementStatus
  easypaisaStatus: EasypaisaElementStatus
  error: string | null
  mountCardFormRef: React.RefObject<HTMLDivElement> | ((node: HTMLDivElement | null) => void)
  mountPixButtonRef: React.RefObject<HTMLDivElement> | ((node: HTMLDivElement | null) => void)
  mountEasypaisaButtonRef: React.RefObject<HTMLDivElement> | ((node: HTMLDivElement | null) => void)
}

export const PaymentDetails = <M extends string>({
  paymentMethods,
  paymentMethod,
  onSelect,
  status,
  pixStatus,
  easypaisaStatus,
  error,
  mountCardFormRef,
  mountPixButtonRef,
  mountEasypaisaButtonRef,
}: PaymentDetailsProps<M>) => {
  return (
    <div className="">
      {/* Payment details wrapper component */}
      <PaymentMethodSelector methods={paymentMethods} value={paymentMethod} onChange={onSelect} />
      <div className="space-y-4">
        <div className={paymentMethod !== 'card' ? 'hidden' : ''}>
          <CardPaymentContainer status={status} error={error} mountRef={mountCardFormRef} />
        </div>
        <div className={paymentMethod !== 'pix' ? 'hidden' : ''}>
          <PixElement status={pixStatus} error={error} mountRef={mountPixButtonRef} />
        </div>
        <div className={paymentMethod !== 'easypaisa' ? 'hidden' : ''}>
          <EasypaisaElement status={easypaisaStatus} error={error} mountRef={mountEasypaisaButtonRef} />
        </div>
      </div>
    </div>
  )
}

export default PaymentDetails

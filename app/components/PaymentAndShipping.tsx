"use client"
/**
 * PaymentAndShipping (Getting Started)
 * ---------------------------------------------------------------------------
 * Minimal UI that:
 *  1. Lets the user pick a payment method (currently only 'Card' is functional).
 *  2. Derives a total amount (sum of product prices).
 *  3. Delegates Payrails SDK work to the usePayrailsElements hook.
 *
 * Omissions: robust validation, localization, tax/shipping calculations, accessibility polish.
 */
import React, { useMemo, useState } from 'react'

import ExpressCheckoutButtonContainer from './ExpressCheckoutButtonContainer'
import PaymentDetails from './PaymentDetails'
import PaymentButton from './PaymentButton'

import { usePayrailsElements } from '../hooks/usePayrailsElements'

interface PaymentAndShippingProps {
    products: number[]
    currency?: string // default USD for demo
    holderReference: string
}

export const PaymentAndShipping: React.FC<PaymentAndShippingProps> = ({ products, currency = 'BRL', holderReference }) => {
    // User selects a method (this flips `enabled` in the hook)
    const [paymentMethod, setPaymentMethod] = useState<('card' | 'pix' | 'easypaisa')>('card')
    const paymentMethods = [
        { id: 'pm-card', value: 'card' as const, title: 'Credit Card' },
        { id: 'pm-pix', value: 'pix' as const, title: 'Pix' },
        { id: 'pm-easypaisa', value: 'easypaisa' as const, title: 'Easypaisa' },
    ]

    // Derive subtotal from product list (demo parsing)
    const subtotal = useMemo(
        () =>
            products.reduce((acc, p) => {
                return acc + (isNaN(p) ? 0 : p)
            }, 0),
        [products]
    )

    const { status, error, mountCardFormRef, mountPaymentButtonRef, mountApplePayButtonRef, mountGooglePayButtonRef, mountPayPalButtonRef, mountPixButtonRef, mountEasypaisaButtonRef } = usePayrailsElements({
        amount: subtotal,
        currency,
        holderReference,
        paymentMethod: paymentMethod ?? undefined
    })

    return (
        <section
            aria-labelledby="payment-and-shipping-heading"
            className="bg-gray-950 rounded-2xl p-16 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:w-full lg:max-w-lg lg:pt-0 lg:pb-24 mb-16"
        >
            <h2 id="payment-and-shipping-heading" className="sr-only">
                Payment and shipping details
            </h2>
            <form onSubmit={(e) => e.preventDefault()}>
                <div className="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-0">
                    <ExpressCheckoutButtonContainer
                        status={status}
                        error={error}
                        mountApplePayRef={mountApplePayButtonRef}
                        mountGooglePayRef={mountGooglePayButtonRef}
                        mountPayPalRef={mountPayPalButtonRef}
                    />

                    <PaymentDetails
                        paymentMethods={paymentMethods}
                        paymentMethod={paymentMethod}
                        onSelect={(val) => setPaymentMethod(val)}
                        status={status}
                        pixStatus={status}
                        easypaisaStatus={status}
                        error={error}
                        mountCardFormRef={mountCardFormRef}
                        mountPixButtonRef={mountPixButtonRef}
                        mountEasypaisaButtonRef={mountEasypaisaButtonRef}
                    />

                    <div className={paymentMethod !== 'card' ? 'hidden' : ''}>
                        <PaymentButton mountRef={mountPaymentButtonRef} />
                    </div>
                    
                </div>
            </form>
        </section>
    )
}

export default PaymentAndShipping

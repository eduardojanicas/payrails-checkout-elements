"use client"
/**
 * PaymentAndShipping (Getting Started)
 * ---------------------------------------------------------------------------
 * Minimal UI that:
 *  1. Collects basic customer + address data.
 *  2. Lets the user pick a payment method (currently only 'Card' is functional).
 *  3. Derives a total amount (sum of product price strings).
 *  4. Delegates Payrails SDK work to the usePayrailsElements hook.
 *  5. Disables the payment button until form + SDK are both ready.
 *
 * Omissions: robust validation, localization, tax/shipping calculations, accessibility polish.
 */
import React, { useMemo, useState } from 'react'

import ExpressCheckoutButtonContainer from './ExpressCheckoutButtonContainer'
import PaymentDetails from './PaymentDetails'
import PaymentButton from './PaymentButton'

import { usePayrailsElements } from '../hooks/usePayrailsElements'
import type { ProductSummaryItem } from './OrderSummary'

interface PaymentAndShippingProps {
    products: ProductSummaryItem[]
    currency?: string // default USD for demo
    holderReference: string
}

export const PaymentAndShipping: React.FC<PaymentAndShippingProps> = ({ products, currency = 'USD', holderReference }) => {
    // STEP 1: User selects a method (this flips `enabled` in the hook)
    const [paymentMethod, setPaymentMethod] = useState<('card' | 'pix' | 'upi')>('card')
    const paymentMethods = [
        { id: 'pm-card', value: 'card' as const, title: 'Credit Card' },
        { id: 'pm-pix', value: 'pix' as const, title: 'Pix' },
        { id: 'pm-upi', value: 'upi' as const, title: 'UPI' },
    ]

    // STEP 2: Derive subtotal from product list (demo parsing)
    const subtotal = useMemo(
        () =>
            products.reduce((acc, p) => {
                const n = parseFloat(p.price.replace(/[^0-9.]/g, ''))
                return acc + (isNaN(n) ? 0 : n)
            }, 0),
        [products]
    )

    const { status, error, mountCardFormRef, mountPaymentButtonRef, mountApplePayButtonRef, mountGooglePayButtonRef, mountPayPalButtonRef } = usePayrailsElements({
        amount: subtotal,
        currency,
        holderReference,
        enabled: !!paymentMethod, // defer init until user selects method
        paymentMethod: paymentMethod ?? undefined
    })

    return (
        <section
            aria-labelledby="payment-and-shipping-heading"
            className="py-16 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:w-full lg:max-w-lg lg:pt-0 lg:pb-24"
        >
            <h2 id="payment-and-shipping-heading" className="sr-only">
                Payment and shipping details
            </h2>
            <form>
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
                        error={error}
                        mountCardFormRef={mountCardFormRef}
                    />

                    {/* <AddressFields
                        value={{ address: form.address, city: form.city, region: form.region, postal: form.postal }}
                        onChange={(patch) => update(patch)}
                    /> */}

                    <PaymentButton mountRef={mountPaymentButtonRef} />
                </div>
            </form>
        </section>
    )
}

export default PaymentAndShipping

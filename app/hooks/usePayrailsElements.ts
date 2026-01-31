"use client"
/**
 * usePayrailsElements (Getting Started Demo)
 * ---------------------------------------------------------------------------
 * Minimal hook showing how to:
 *  1. Fetch an init payload from /api/init (server performs OAuth + Payrails init).
 *  2. Initialize the Payrails Web SDK.
 *  3. Mount the Card Form (when paymentMethod === 'card').
 *  4. Redirect to simple success / failure pages.
 *
 * Kept intentionally small: no advanced retries, analytics, styling config, or edge‑case handling.
 * Feel free to fork and enhance for production.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Payrails } from '@payrails/web-sdk'

export interface UsePayrailsElementsOptions {
    amount: number          // Minor units (e.g. 9995 == $99.95)
    currency: string        // ISO 4217 currency code
    workflowCode?: string   // Workflow to execute (default 'payment-acceptance')
    workspaceId?: string    // Optional override (normally handled server-side)
    holderReference?: string // Merchant-side customer identifier
    enabled?: boolean       // Defer initialization until true (e.g. after user picks a method)
    paymentMethod?: 'card' | 'pix' | 'upi' // Used to conditionally mount elements
}

export type PayrailsElementsStatus = 'idle' | 'loading' | 'ready' | 'error'

interface UsePayrailsElementsReturn {
    status: PayrailsElementsStatus
    error: string | null
    /** Attach to an empty div where the Card Form should mount */
    mountCardFormRef: (node: HTMLDivElement | null) => void
    /** Attach to an empty div where the Payment Button should mount */
    mountPaymentButtonRef: (node: HTMLDivElement | null) => void
    /** Attach to an empty div where the Apple Pay Button should mount */
    mountApplePayButtonRef: (node: HTMLDivElement | null) => void
    /** Attach to an empty div where the Google Pay Button should mount */
    mountGooglePayButtonRef: (node: HTMLDivElement | null) => void
    /** Attach to an empty div where the PayPal Button should mount */
    mountPayPalButtonRef: (node: HTMLDivElement | null) => void
    /** Workflow execution identifier (best-effort extraction from init payload) */
    executionId: string | null
}

// Workspace ID is not secret
const DEFAULT_WORKSPACE_ID = process.env.PAYRAILS_WORKSPACE_ID

export function usePayrailsElements(options: UsePayrailsElementsOptions): UsePayrailsElementsReturn {
    const { amount, currency, workflowCode = 'payment-acceptance', workspaceId = DEFAULT_WORKSPACE_ID, holderReference = 'holder-abc', enabled = true, paymentMethod } = options

    const [status, setStatus] = useState<PayrailsElementsStatus>('idle')
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const routerRef = useRef(router)
    useEffect(() => { routerRef.current = router }, [router])

    // DOM container refs where SDK elements will mount.
    const cardFormContainerRef = useRef<HTMLDivElement | null>(null)
    const paymentButtonContainerRef = useRef<HTMLDivElement | null>(null)
    const applePayButtonContainerRef = useRef<HTMLDivElement | null>(null)
    const googlePayButtonContainerRef = useRef<HTMLDivElement | null>(null)
    const payPalButtonContainerRef = useRef<HTMLDivElement | null>(null)

    // Deterministic IDs allow mounting via CSS selector (simpler for examples).
    const CARD_FORM_ID = 'card-form-container'
    const PAYMENT_BUTTON_ID = 'payment-button-container'
    const APPLE_PAY_BUTTON_ID = 'apple-pay-button-container'
    const GOOGLE_PAY_BUTTON_ID = 'google-pay-button-container'
    const PAYPAL_BUTTON_ID = 'paypal-button-container'

    const [executionId, setExecutionId] = useState<string | null>(null)
    const initializedRef = useRef<boolean>(false)

    const mountCardFormRef = useCallback((node: HTMLDivElement | null) => {
        cardFormContainerRef.current = node
    }, [])

    const mountPaymentButtonRef = useCallback((node: HTMLDivElement | null) => {
        paymentButtonContainerRef.current = node
    }, [])

    const mountApplePayButtonRef = useCallback((node: HTMLDivElement | null) => {
        applePayButtonContainerRef.current = node
    }, [])

    const mountGooglePayButtonRef = useCallback((node: HTMLDivElement | null) => {
        googlePayButtonContainerRef.current = node
    }, [])

    const mountPayPalButtonRef = useCallback((node: HTMLDivElement | null) => {
        payPalButtonContainerRef.current = node
    }, [])

    // Helpers ---------------------------------------------------------------

    type PayrailsClient = {
        cardForm?: (cfg: Record<string, unknown>) => { mount: (sel: string | HTMLElement) => void }
        paymentButton?: (cfg: Record<string, unknown>) => { mount: (sel: string | HTMLElement) => void }
        applePayButton?: (cfg: Record<string, unknown>) => { mount: (sel: string | HTMLElement) => void }
        googlePayButton?: (cfg: Record<string, unknown>) => { mount: (sel: string | HTMLElement) => void }
        paypalButton?: (cfg: Record<string, unknown>) => { mount: (sel: string | HTMLElement) => void }
    }

    // Stable merchant reference (initialized once). Use lazy initializer to avoid purity lint.
    const merchantReferenceRef = useRef<string>('')
    // Use performance.now via effect to avoid render-time impurity complaints.
    useEffect(() => {
        if (!merchantReferenceRef.current) {
            merchantReferenceRef.current = `order-${Math.round(performance.now())}`
        }
    }, [])

    const fetchInitPayload = useCallback(async (): Promise<Parameters<typeof Payrails.init>[0]> => {
        // STEP 3.1: Request init payload from backend
        const resp = await fetch('/api/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, currency, workflowCode, merchantReference: merchantReferenceRef.current, holderReference, workspaceId }),
        })
        if (!resp.ok) throw new Error('Init request failed')
        const initPayload: unknown = await resp.json()
        const payloadObj = initPayload as Record<string, unknown> | null
        return (payloadObj && 'res' in payloadObj ? (payloadObj as Record<string, unknown>)['res'] : initPayload) as Parameters<typeof Payrails.init>[0]
    }, [amount, currency, workflowCode, holderReference, workspaceId])

    const initSdk = useCallback((raw: Parameters<typeof Payrails.init>[0]): PayrailsClient => {
        // STEP 3.2: Initialize SDK
        return Payrails.init(raw, {
            redirectFor3DS: false,
            events: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onClientInitialized: async (execution: any) => {
                    setExecutionId(execution?.response?.id ?? null)
                },
            },
            returnInfo: {
                success: 'payrails.com/success',
                cancel: 'payrails.com/failure',
                error: 'payrails.com/error',
                pending: 'payrails.com/pending',
            },
        }) as unknown as PayrailsClient
    }, [])

    const mountCardFormIfNeeded = useCallback((client: PayrailsClient) => {
        // STEP 3.3: Mount card form (only for card payment method)
        if (paymentMethod !== 'card' || !cardFormContainerRef.current || !client.cardForm) return
        const cardForm = client.cardForm({
            showSingleExpiryDateField: true,
            // showPaymentMethodLogo: true,
            showStoreInstrumentCheckbox: true,
            styles: {
                storeInstrumentCheckbox: {
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: '8px',
                    color: '#aaaaaa',
                },
                inputFields: {
                    all: {
                        base: {
                            border: '1px solid black',
                            borderRadius: '5px',
                            margin: {
                                top: 5, // jss-default-unit makes this 5px
                                right: 5,
                                bottom: 5,
                                left: 5
                            },
                            backgroundColor: "#303030",
                        },
                        focus: {
                            backgroundColor: "#040717",
                            borderColor: "#1447e6",
                            color: "white",
                        },
                        invalid: {
                            backgroundColor: "#040717",
                            borderColor: "#c10007",
                            color: "white",
                        },
                        complete: {
                            backgroundColor: "#040717",
                            borderColor: "#008236",
                            color: "white",
                        }
                    },
                    CARD_NUMBER: {
                        base: {
                            maxWidth: "calc(100% - 0.5rem)",
                        },
                    },
                    EXPIRATION_DATE: {
                        base: {
                            maxWidth: "calc(100% - 0.5rem)",
                        },
                        cardIcon: {
                            display: 'none',
                        },
                    },
                    CVV: {
                        base: {
                            maxWidth: "calc(100% - 0.5rem)",
                        },
                        cardIcon: {
                            display: 'none',
                        },
                    },
                },
            },
            translations: {
                labels: {
                    storeInstrument: "Save card for faster checkout",
                },
            },
        })
        cardForm.mount(`#${CARD_FORM_ID}`)

        // Make the "store instrument" checkbox look like a toggle.
        // Limitation: Payrails applies `styles.storeInstrumentCheckbox` only to the wrapper element,
        // so we inject a scoped <style> tag here to style the nested input/label.
        setTimeout(() => {
            const container = cardFormContainerRef.current
            if (!container) return

            const styleId = 'payrails-toggle-styles'
            if (!container.querySelector(`#${styleId}`)) {
                const styleEl = document.createElement('style')
                styleEl.id = styleId
                styleEl.textContent = `
                #${CARD_FORM_ID} label.payrails-toggle {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    user-select: none;
                    padding: 6px 0;
                    font-size: 14px;
                    line-height: 1.25;
                    color: inherit;
                }

                #${CARD_FORM_ID} label.payrails-toggle > input.payrails-store-instrument-checkbox {
                    position: absolute;
                    opacity: 0;
                    width: 1px;
                    height: 1px;
                    pointer-events: none;
                }

                #${CARD_FORM_ID} label.payrails-toggle::before {
                    content: "";
                    width: 40px;
                    height: 22px;
                    border-radius: 9999px;
                    background: rgba(148, 163, 184, 0.35);
                    box-sizing: border-box;
                    transition: background-color 150ms ease, border-color 150ms ease;
                    flex: none;
                }

                #${CARD_FORM_ID} label.payrails-toggle::after {
                    content: "";
                    position: absolute;
                    left: 2px;
                    top: 50%;
                    width: 18px;
                    height: 18px;
                    border-radius: 9999px;
                    background: #ffffff;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
                    transform: translate(0, -50%);
                    transition: transform 150ms ease;
                }

                #${CARD_FORM_ID} label.payrails-toggle[data-checked="true"]::before {
                    background: #1447e6;
                    border-color: #1447e6;
                }

                #${CARD_FORM_ID} label.payrails-toggle[data-checked="true"]::after {
                    transform: translate(18px, -50%);
                }

                `.trim()
                container.appendChild(styleEl)
            }

            const input = container.querySelector('input.payrails-store-instrument-checkbox') as HTMLInputElement | null
            const label = input?.closest('label') as HTMLLabelElement | null
            if (!input || !label) return
            if (label.dataset.toggleInitialized === 'true') return
            label.dataset.toggleInitialized = 'true'

            label.classList.add('payrails-toggle')
            const sync = () => {
                label.dataset.checked = input.checked ? 'true' : 'false'
            }
            sync()
            input.addEventListener('change', sync)
        }, 0)
    }, [paymentMethod])

    const mountApplePayButton = useCallback((client: PayrailsClient) => {
        // STEP 3.4a: Mount Apple Pay button for express checkout
        // TODO: Add availability check using payrails.isApplePayAvailable() to conditionally render
        if (!applePayButtonContainerRef.current || !client.applePayButton) return
        const applePayButton = client.applePayButton({
            style: 'black',
            type: 'plain',
            events: {
                onAuthorizeSuccess: () => routerRef.current.push(`/order/success?ref=${merchantReferenceRef.current}`),
                onAuthorizeFailed: () => routerRef.current.push(`/order/failure?ref=${merchantReferenceRef.current}&reason=authorization_failed`),
            },
        })
        applePayButton.mount(`#${APPLE_PAY_BUTTON_ID}`)
    }, [])

    const mountGooglePayButton = useCallback((client: PayrailsClient) => {
        // STEP 3.4b: Mount Google Pay button for express checkout
        // TODO: Add availability check using payrails.isGooglePayAvailable() to conditionally render
        if (!googlePayButtonContainerRef.current || !client.googlePayButton) return
        const googlePayButton = client.googlePayButton({
            environment: 'TEST',
            styles: {
                buttonType: 'plain',
                buttonColor: 'white',
            },
            events: {
                onAuthorizeSuccess: () => routerRef.current.push(`/order/success?ref=${merchantReferenceRef.current}`),
                onAuthorizeFailed: () => routerRef.current.push(`/order/failure?ref=${merchantReferenceRef.current}&reason=authorization_failed`),
            },
        })
        googlePayButton.mount(`#${GOOGLE_PAY_BUTTON_ID}`)
    }, [])

    const mountPayPalButton = useCallback((client: PayrailsClient) => {
        // STEP 3.4c: Mount PayPal button for express checkout
        // TODO: Add availability check using onPaypalAvailable event to conditionally render
        if (!payPalButtonContainerRef.current || !client.paypalButton) return
        const paypalButton = client.paypalButton({
            styles: {
                color: 'blue',
                shape: 'rect',
                label: 'paypal',
            },
            events: {
                onAuthorizeSuccess: () => routerRef.current.push(`/order/success?ref=${merchantReferenceRef.current}`),
                onAuthorizeFailed: () => routerRef.current.push(`/order/failure?ref=${merchantReferenceRef.current}&reason=authorization_failed`),
            },
        })
        paypalButton.mount(`#${PAYPAL_BUTTON_ID}`)
    }, [])

    const mountPaymentButton = useCallback((client: PayrailsClient) => {
        // STEP 3.4d: Mount payment button
        if (!client.paymentButton) return
        const paymentButton = client.paymentButton({
            styles: {
                base: {
                    width: 'full',
                    backgroundColor: '#1447e6',
                    color: '#fff',
                    borderRadius: '24px',
                    padding: '8px 24px',
                },
                disabled: {
                    backgroundColor: '#1447e6',
                    border: 'none',
                    opacity: '0.5',
                }
            },
            translations: { label: 'Pay' },
            events: {
                onAuthorizeSuccess: () => routerRef.current.push(`/order/success?ref=${merchantReferenceRef.current}`),
                onAuthorizeFailed: () => routerRef.current.push(`/order/failure?ref=${merchantReferenceRef.current}&reason=authorization_failed`),
            },
        })
        paymentButton.mount(`#${PAYMENT_BUTTON_ID}`)
        // Light post-mount styling to align with Tailwind examples.
        setTimeout(() => {
            const btn = paymentButtonContainerRef.current?.querySelector('button')
            if (btn) {
                (btn as HTMLButtonElement).className = 'w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed'
            }
        }, 0)
    }, [])

    // STEP 3: Lazy initialize Payrails once a payment method is chosen and container exists
    useEffect(() => {
        let cancelled = false
        const readyToInit = enabled && paymentButtonContainerRef.current && !initializedRef.current
        if (!readyToInit) return
        const run = async () => {
            setStatus('loading')
            setError(null)
            try {
                const raw = await fetchInitPayload()
                const client = initSdk(raw)
                mountCardFormIfNeeded(client)
                mountApplePayButton(client)
                mountGooglePayButton(client)
                mountPayPalButton(client)
                mountPaymentButton(client)
                if (!cancelled) {
                    initializedRef.current = true
                    setStatus('ready')
                }
            } catch {
                if (!cancelled) {
                    setError('Initialization failed')
                    setStatus('error')
                }
            }
        }
        run()
        return () => {
            cancelled = true
        }
    }, [amount, currency, workflowCode, holderReference, workspaceId, enabled, paymentMethod, fetchInitPayload, initSdk, mountCardFormIfNeeded, mountApplePayButton, mountGooglePayButton, mountPayPalButton, mountPaymentButton])

    return { status, error, mountCardFormRef, mountPaymentButtonRef, mountApplePayButtonRef, mountGooglePayButtonRef, mountPayPalButtonRef, executionId }
}

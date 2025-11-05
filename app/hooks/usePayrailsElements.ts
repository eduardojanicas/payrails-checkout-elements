"use client"
/**
 * usePayrailsElements (Getting Started Demo)
 * ---------------------------------------------------------------------------
 * Minimal hook showing how to:
 *  1. Fetch an init payload from /api/init (server performs OAuth + Payrails init).
 *  2. Initialize the Payrails Web SDK.
 *  3. Mount the Card Form (when paymentMethod === 'card').
 *  4. Mount a Payment Button that optionally performs a lookup enrichment before authorization.
 *  5. Redirect to simple success / failure pages.
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
    paymentMethod?: 'card' | 'paypal'
    customerInfoProvider?: () => ({ // Called right before authorization to enrich metadata
        email: string
        address: string
        city: string
        region: string
        postal: string
    }) | null
}

export type PayrailsElementsStatus = 'idle' | 'loading' | 'ready' | 'error'

interface UsePayrailsElementsReturn {
    status: PayrailsElementsStatus
    error: string | null
    /** Attach to an empty div where the Card Form should mount */
    mountCardFormRef: (node: HTMLDivElement | null) => void
    /** Attach to an empty div where the Payment Button should mount */
    mountPaymentButtonRef: (node: HTMLDivElement | null) => void
    /** Workflow execution identifier (best-effort extraction from init payload) */
    executionId: string | null
}

// Workspace ID is not secret
const DEFAULT_WORKSPACE_ID = process.env.PAYRAILS_WORKSPACE_ID

export function usePayrailsElements(options: UsePayrailsElementsOptions): UsePayrailsElementsReturn {
    const { amount, currency, workflowCode = 'payment-acceptance', workspaceId = DEFAULT_WORKSPACE_ID, holderReference = 'holder-abc', enabled = true, paymentMethod, customerInfoProvider } = options

    const [status, setStatus] = useState<PayrailsElementsStatus>('idle')
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const routerRef = useRef(router)
    useEffect(() => { routerRef.current = router }, [router])

    // DOM container refs where SDK elements will mount.
    const cardFormContainerRef = useRef<HTMLDivElement | null>(null)
    const paymentButtonContainerRef = useRef<HTMLDivElement | null>(null)

    // Deterministic IDs allow mounting via CSS selector (simpler for examples).
    const CARD_FORM_ID = 'card-form-container'
    const PAYMENT_BUTTON_ID = 'payment-button-container'

    const [executionId, setExecutionId] = useState<string | null>(null)
    const customerInfoProviderRef = useRef<typeof customerInfoProvider | null>(null)
    useEffect(() => { customerInfoProviderRef.current = customerInfoProvider }, [customerInfoProvider])
    const initializedRef = useRef<boolean>(false)

    const mountCardFormRef = useCallback((node: HTMLDivElement | null) => {
        cardFormContainerRef.current = node
    }, [])

    const mountPaymentButtonRef = useCallback((node: HTMLDivElement | null) => {
        paymentButtonContainerRef.current = node
    }, [])

    // Helpers ---------------------------------------------------------------

    type PayrailsClient = {
        cardForm?: (cfg: Record<string, unknown>) => { mount: (sel: string | HTMLElement) => void }
        paymentButton?: (cfg: Record<string, unknown>) => { mount: (sel: string | HTMLElement) => void }
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
        const cardForm = client.cardForm({ cards: { showCardHolderName: true } })
        cardForm.mount(`#${CARD_FORM_ID}`)
    }, [paymentMethod])

    const enrichBeforeAuthorize = useCallback(async () => {
        // STEP 4: (Optional) Enrichment before authorization via lookup
        const info = customerInfoProviderRef.current?.()
        if (!info || !executionId) return true
        try {
            const resp = await fetch('/api/lookup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workflowCode,
                    executionId: executionId,
                    customer: { email: info.email },
                    amount: { value: amount, currency },
                    order: { billingAddress: { street: info.address, city: info.city, state: info.region, postalCode: info.postal } },
                }),
            })
            return resp.ok
        } catch {
            return false
        }
    }, [workflowCode, amount, currency, executionId])

    const mountPaymentButton = useCallback((client: PayrailsClient) => {
        // STEP 3.4: Mount payment button
        if (!client.paymentButton) return
        const paymentButton = client.paymentButton({
            translations: { label: 'Pay' },
            events: {
                onPaymentButtonClicked: enrichBeforeAuthorize,
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
    }, [enrichBeforeAuthorize])

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
    }, [amount, currency, workflowCode, holderReference, workspaceId, enabled, paymentMethod, fetchInitPayload, initSdk, mountCardFormIfNeeded, mountPaymentButton])

    return { status, error, mountCardFormRef, mountPaymentButtonRef, executionId }
}

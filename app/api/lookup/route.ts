import { NextResponse } from 'next/server'

/**
 * /api/lookup (Tutorial Endpoint)
 * --------------------------------------------------------------
 * Adds lightweight metadata enrichment to an existing workflow execution
 * BEFORE authorization (triggered from the payment button click handler).
 *
 * Simplifications:
 *  - Minimal validation (only required fields).
 *  - Returns raw response from Payrails lookup.
 *  - No auth / rate limiting / PII scrubbing.
 */

interface LookupBodyCustomer {
    email?: string
    address?: string
    city?: string
    region?: string
    postalCode?: string
}
interface LookupBodyOrder {
    billingAddress?: {
        street?: string,
        city?: string,
        state?: string,
        postalCode?: string,
    }
}
interface LookupBodyAmount {
    value?: number
    currency?: string
}
interface LookupBody {
    workflowCode?: string
    executionId?: string
    customer?: LookupBodyCustomer
    order?: LookupBodyOrder
    amount?: LookupBodyAmount
}

export async function POST(req: Request) {
    // STEP 4 (backend): Enrichment endpoint receives customer/order metadata
    const baseUrl = process.env.PAYRAILS_BASE_URL || 'https://api.payrails.com'
    const clientId = requiredEnv('PAYRAILS_CLIENT_ID')
    const clientSecret = requiredEnv('PAYRAILS_CLIENT_SECRET')

    let body: LookupBody = {}
    try {
        if (req.headers.get('content-type')?.includes('application/json')) {
            body = await req.json()
        }
    } catch (e) {
        return fail('Invalid JSON body', 400, (e as Error).message)
    }

    const { workflowCode, executionId, customer, order, amount } = body || {}

    if (!workflowCode || typeof workflowCode !== 'string') return fail('workflowCode required', 400)
    if (!executionId || typeof executionId !== 'string') return fail('executionId required', 400)
    if (!customer?.email) return fail('customer.email required', 400)
    if (!amount?.value || typeof amount.value !== 'number') return fail('amount.value required', 400)
    if (!amount?.currency) return fail('amount.currency required', 400)
    if (!order?.billingAddress) return fail('billingAddress required', 400)

    // Build minimal meta payload – adapt for additional fields as needed.
    const lookupPayload = {
        amount: { value: String(amount.value), currency: amount.currency },
        meta: {
            customer: { email: customer.email },
            order: { billingAddress: { street: order.billingAddress?.street, city: order.billingAddress?.city, state: order.billingAddress?.state, postalCode: order.billingAddress?.postalCode } },
        },
    }

    try {
        // OAuth
    // STEP 4.1: OAuth token
    const tokenRes = await fetch(`${baseUrl}/auth/token/${clientId}`, {
            method: 'POST',
            headers: { Accept: 'application/json', 'x-api-key': clientSecret },
        })
        if (!tokenRes.ok) return fail('Failed to fetch access token', 502, await tokenRes.text())
        const { access_token } = (await tokenRes.json()) as { access_token: string }

        // Lookup action
        const url = `${baseUrl}/merchant/workflows/${workflowCode}/executions/${executionId}/lookup`
    // STEP 4.2: Lookup enrichment call
    const lookupRes = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${access_token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'x-idempotency-key': crypto.randomUUID(),
            },
            body: JSON.stringify(lookupPayload),
        })
        if (!lookupRes.ok) return fail('Lookup failed', 502, await lookupRes.text())
        const result = await lookupRes.json()
        return NextResponse.json(result)
    } catch (err) {
        return fail('Server error', 500, (err as Error).message)
    }
}

function requiredEnv(name: string) {
    const v = process.env[name]
    if (!v) throw new Error(`Missing required env var: ${name}`)
    return v
}

function fail(message: string, status: number, details?: string) {
    return NextResponse.json({ error: message, details }, { status })
}

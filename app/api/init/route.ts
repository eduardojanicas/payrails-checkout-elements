import { NextResponse } from 'next/server'

/**
 * /api/init (Tutorial Endpoint)
 * --------------------------------------------------------------
 * 1. Obtain OAuth token using client credentials (env vars).
 * 2. Call Payrails client init endpoint with minimal payload.
 * 3. Return the raw config JSON to the browser (hook initializes SDK).
 *
 * Simplified: light validation & generic errors. Expand for production.
 */
export async function POST(req: Request) {
    // STEP 3 (backend part A): Prepare environment + read credentials
    const baseUrl = process.env.PAYRAILS_BASE_URL || 'https://api.payrails.com'
    const clientId = requiredEnv('PAYRAILS_CLIENT_ID')
    const clientSecret = requiredEnv('PAYRAILS_CLIENT_SECRET')

    interface HolderInfo { id?: string; email?: string; name?: string }
    interface InitRequestBody {
        amount?: number;
        currency?: string;
        holder?: HolderInfo;
        workflowCode?: string;
        merchantReference?: string;
        holderReference?: string;
        workspaceId?: string;
    }
    let body: InitRequestBody = {}

    try {
        if (req.headers.get('content-type')?.includes('application/json')) {
            body = await req.json()
        }
    } catch (e) {
        return fail('Invalid JSON body', 400, (e as Error).message)
    }

    const {
        amount,
        currency,
        workflowCode,
        merchantReference,
        holderReference,
        workspaceId,
    } = body || {}

    // Basic validation (extend as needed).
    if (amount !== undefined && typeof amount !== 'number') {
        return fail('amount must be a number', 400)
    }
    if (currency !== undefined && typeof currency !== 'string') {
        return fail('currency must be a string', 400)
    }
    // Validate additional string params if provided
    const strFields: [string, unknown][] = [
        ['workflowCode', workflowCode],
        ['merchantReference', merchantReference],
        ['holderReference', holderReference],
        ['workspaceId', workspaceId],
    ];
    for (const [name, value] of strFields) {
        if (value !== undefined && typeof value !== 'string') {
            return fail(`${name} must be a string`, 400)
        }
    }

    // Build minimal payload including provided identifiers.
    // Payrails expects type=dropIn plus additional context.
    const initPayload: Record<string, unknown> = { type: 'dropIn' }

    initPayload.amount = { value: String(amount), currency } // e.g. { value: "9995", currency: "USD" }
    // e.g. 23200 minor units or 232.00 - follow your account conventions
    // ISO 4217 code, e.g. 'USD'

    // Required contextual parameters (provide defaults if not passed):
    initPayload.workflowCode = workflowCode || 'payment-acceptance'
    initPayload.merchantReference = merchantReference || 'order-123'
    initPayload.holderReference = holderReference || 'holder-123'
    initPayload.workspaceId = workspaceId || process.env.PAYRAILS_WORKSPACE_ID || 'missing-workspace-id'

    try {
        // Step 1: OAuth token
    // STEP 3.1: Obtain OAuth access token
    const tokenRes = await fetch(`${baseUrl}/auth/token/${clientId}`, {
            method: 'POST',
            headers: { Accept: 'application/json', 'x-api-key': clientSecret },
        })
        if (!tokenRes.ok) return fail('Failed to fetch access token', 502, await tokenRes.text())
        const { access_token } = await tokenRes.json() as { access_token: string }

        // Step 2: Display init
    // STEP 3.2: Request Payrails client init configuration
    const initRes = await fetch(`${baseUrl}/merchant/client/init`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${access_token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'x-idempotency-key': crypto.randomUUID(),
            },
            body: JSON.stringify(initPayload),
        })
        if (!initRes.ok) return fail('Init request failed', 502, await initRes.text())

        const config = await initRes.json()
        return NextResponse.json(config)
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
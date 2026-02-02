import { NextResponse } from 'next/server'
import https from 'https';

export const runtime = 'nodejs'

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
    // (backend part A): Prepare environment + read credentials
    const baseUrl = process.env.PAYRAILS_API_URL || process.env.PAYRAILS_BASE_URL || 'https://api.payrails.com'
    const clientId = requiredEnv('PAYRAILS_CLIENT_ID')
    const clientSecret = requiredEnv('PAYRAILS_CLIENT_SECRET')
    const client_cert_pem = requiredEnv('PAYRAILS_CLIENT_CERT_PEM')
    const client_key_pem = requiredEnv('PAYRAILS_CLIENT_KEY_PEM')

    // Single keep-alive mTLS agent
    const agent = new https.Agent({
        cert: normalizePem(client_cert_pem),
        key: normalizePem(client_key_pem),
        keepAlive: true,
    });

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
        // Step 1: OAuth token (mTLS)
        const tokenJson = await postJson<{ access_token: string }>(
            baseUrl,
            `/auth/token/${encodeURIComponent(clientId)}`,
            {},
            {
                Accept: 'application/json',
                'x-api-key': clientSecret,
            },
            agent,
        )

        if (!tokenJson?.access_token) return fail('Failed to fetch access token', 502, 'No access_token in response')

        // Step 2: client init (mTLS)
        const idempotencyKey = (globalThis.crypto?.randomUUID && globalThis.crypto.randomUUID()) || Math.random().toString(36).slice(2)
        const config = await postJson<unknown>(
            baseUrl,
            '/merchant/client/init',
            initPayload,
            {
                Authorization: `Bearer ${tokenJson.access_token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'x-idempotency-key': idempotencyKey,
            },
            agent,
        )

        return NextResponse.json(config)
    } catch (err) {
        return fail('Server error', 500, (err as Error).message)
    }
}

function normalizePem(raw?: string) {
    return (raw || '').replace(/\\n/g, '\n').trim()
}

function postJson<T>(
    baseUrl: string,
    path: string,
    body: Record<string, unknown>,
    headers: Record<string, string>,
    agent: https.Agent,
): Promise<T> {
    const url = new URL(path, baseUrl)
    if (url.protocol !== 'https:') {
        return Promise.reject(new Error(`Unsupported protocol for mTLS request: ${url.protocol}`))
    }

    const payload = JSON.stringify(body)

    return new Promise((resolve, reject) => {
        const req = https.request(
            {
                method: 'POST',
                hostname: url.hostname,
                port: url.port ? Number(url.port) : undefined,
                path: url.pathname + url.search,
                headers: {
                    'User-Agent': 'payrails-retail-demo/1.0',
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload).toString(),
                    ...headers,
                },
                agent,
            },
            (res) => {
                let data = ''
                res.on('data', (chunk) => {
                    data += chunk
                })
                res.on('end', () => {
                    const status = res.statusCode || 0
                    if (status >= 200 && status < 300) {
                        try {
                            resolve((data ? JSON.parse(data) : {}) as T)
                        } catch (e) {
                            reject(new Error('Failed JSON parse: ' + (e as Error).message))
                        }
                    } else {
                        reject(new Error(`Status ${status}: ${data.slice(0, 800)}`))
                    }
                })
            },
        )

        req.on('error', reject)
        req.write(payload)
        req.end()
    })
}

function requiredEnv(name: string) {
    const v = process.env[name]
    if (!v) throw new Error(`Missing required env var: ${name}`)
    return v
}

function fail(message: string, status: number, details?: string) {
    return NextResponse.json({ error: message, details }, { status })
}
<div align="center">
  <h1>Payrails SDK – Getting Started Demo (Next.js)</h1>
  <p>A minimal, step-by-step example showing how to initialize the Payrails Web SDK, mount the drop-in component with multiple payment methods, and handle authorization redirects.</p>
</div>

> This repository is intentionally simplified for documentation & onboarding. It is NOT production ready.

## Quick Start
Prerequisites: Node 18+, a Payrails workspace, and API credentials.

1. Clone & install
	```bash
	pnpm install # or npm / yarn / bun
	```
2. Copy your env template
	```bash
	cp .env.example .env.local
	```
3. Fill in `.env.local` (see `.env.example`):
	- `PAYRAILS_CLIENT_ID` – server OAuth client id
	- `PAYRAILS_CLIENT_SECRET` – server OAuth secret (never expose with NEXT_PUBLIC_)
	- `PAYRAILS_WORKSPACE_ID` – non‑secret workspace id
	- `PAYRAILS_BASE_URL` – override API base (sandbox/staging)
4. Run the dev server
	```bash
	pnpm dev
	```
5. Open https://localhost:3000

## Supported Payment Methods

The drop-in component supports multiple payment methods (configured in your Payrails workspace):

- **Cards** – Credit/debit card payments with optional "save card" functionality
- **Apple Pay** – Native Apple Pay button (available in drop-in or standalone)
- **Google Pay** – Native Google Pay button (available in drop-in or standalone)
- **PayPal** – PayPal checkout button (available in drop-in or standalone)
- **Mercado Pago** – HPP redirect integration
- **Pix** – Brazilian instant payment (HPP redirect)
- **Easypaisa** – Pakistani mobile wallet (HPP redirect)
- **FawryPay** – Egyptian payment method (HPP redirect)

## Integration Flow Overview

| Step | What Happens | Where |
|------|--------------|-------|
| 1 | Render payment UX wrapper | `PaymentDetails` |
| 1b | Drop-in mount target appears | `DropInContainer` |
| 1c | Express checkout buttons mount targets appear | `ExpressCheckoutButtonContainer` |
| 2 | Subtotal derivation & pass to hook | `PaymentAndShipping` |
| 3.1 | Fetch init payload (OAuth + workflow init) | `app/api/init/route.ts` via `usePayrailsElements` |
| 3.2 | Initialize SDK client | `usePayrailsElements` |
| 3.3 | Mount drop-in component | `usePayrailsElements` (targets `DropInContainer`) |
| 3.4 | Mount express checkout buttons | `usePayrailsElements` (targets `ExpressCheckoutButtonContainer`) |
| 4 | Authorization result → redirect | `usePayrailsElements` → success/failure pages |

## Environment Variables

| Variable | Required | Scope | Description |
|----------|----------|-------|-------------|
| `PAYRAILS_CLIENT_ID` | Yes | Server | OAuth client id used by `/api/init` for token exchange. |
| `PAYRAILS_CLIENT_SECRET` | Yes | Server (secret) | OAuth client secret (never exposed client-side). |
| `PAYRAILS_WORKSPACE_ID` | Yes | Client | Primary workspace id. Non-secret. |
| `PAYRAILS_BASE_URL` | Optional | Server | API base override (sandbox/staging). |

Only variables prefixed with `NEXT_PUBLIC_` are bundled for the client. Restart the dev server after changes. Never prefix secrets with `NEXT_PUBLIC_`.

## Files & Responsibilities

- `app/hooks/usePayrailsElements.ts` – Core integration logic (init, mount drop-in & express buttons, redirects).
- `app/components/PaymentAndShipping.tsx` – Orchestrates form state, subtotal, gating.
- `app/components/PaymentDetails.tsx` – Wrapper for payment method UX.
- `app/components/DropInContainer.tsx` – Drop-in component mount target & status UI.
- `app/components/ExpressCheckoutButtonContainer.tsx` – Express checkout buttons (Apple Pay, Google Pay, PayPal) mount container.
- `app/components/PaymentMethodSelector.tsx` – Payment method selection UI.
- `app/api/init/route.ts` – Server-side OAuth + workflow init (returns SDK configuration).
- `app/order/success/page.tsx` / `app/order/failure/page.tsx` – Simple redirect targets.


## `usePayrailsElements` Hook API

### Purpose
Orchestrates Payrails workflow initialization, mounts the drop-in component and express checkout buttons, and handles authorization redirects.

### Options

| Option | Required | Type | Default | Description |
|--------|----------|------|---------|-------------|
| `amount` | Yes | `number` | — | Payment amount (major units, e.g., 99.95 for $99.95). |
| `currency` | Yes | `string` | — | ISO 4217 currency code. |
| `workflowCode` | No | `string` | `payment-acceptance` | Payrails workflow to execute. |
| `workspaceId` | No | `string` | Env resolution | Override workspace id (usually rely on env). |
| `holderReference` | No | `string` | `'holder-abc'` | Merchant customer identifier. |

### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `status` | `'idle' \| 'loading' \| 'ready' \| 'error'` | Current initialization status. |
| `error` | `string \| null` | Error message if status is `'error'`. |
| `mountDropInRef` | `(node: HTMLDivElement \| null) => void` | Ref callback for drop-in container. |
| `mountApplePayButtonRef` | `(node: HTMLDivElement \| null) => void` | Ref callback for standalone Apple Pay button. |
| `mountGooglePayButtonRef` | `(node: HTMLDivElement \| null) => void` | Ref callback for standalone Google Pay button. |
| `mountPayPalButtonRef` | `(node: HTMLDivElement \| null) => void` | Ref callback for standalone PayPal button. |
| `executionId` | `string \| null` | Workflow execution identifier. |

### Status Transition
`idle` → `loading` → (`ready` on success | `error` on failure).

### Minimal Usage Example
```tsx
const { status, error, mountDropInRef, mountApplePayButtonRef, mountGooglePayButtonRef, mountPayPalButtonRef, executionId } = usePayrailsElements({
	amount: 99.95,
	currency: 'EUR'
})

return (
	<div>
		{/* Drop-in with all configured payment methods */}
		<div ref={mountDropInRef} id="drop-in-container" />

		{/* Or mount express checkout buttons separately */}
		<div ref={mountApplePayButtonRef} id="apple-pay-button-container" />
		<div ref={mountGooglePayButtonRef} id="google-pay-button-container" />
		<div ref={mountPayPalButtonRef} id="paypal-button-container" />

		{status === 'error' && <p className="text-red-600">{error}</p>}
	</div>
)
```

## Production Hardening Checklist (Not Implemented Here)

- Server‑side authoritative pricing & currency handling
- Robust validation & user messaging
- Auth/session layer for API routes
- Secret management & rotation
- Retry / backoff for transient network errors
- Observability (structured logs, tracing, metrics)
- Accessibility & localization (ARIA, translations, currency formatting)

## Merchant Reference
Generated client-side via timestamp for simplicity. In production:
1. Generate the order reference server-side.
2. Persist before payment initiation.
3. Re-use consistently across authorization, capture, and reconciliation.

## Scripts
```bash
pnpm dev     # Start dev server
pnpm build   # Production build
pnpm start   # Run built app
```

## License
Provided as-is for instructional purposes. Embed or adapt freely in your docs or prototypes.

---
Happy building with Payrails! ✨

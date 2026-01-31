"use client";
// (Entry Point)
// The payment section. All Payrails logic lives in the PaymentAndShipping component + its hook.

import '@payrails/web-sdk/payrails-styles.css'
import PaymentAndShipping from './components/PaymentAndShipping'
import Image from 'next/image'

// Element mounting & API calls handled in /components/PaymentAndShipping & /hooks/usePayrailsElements.

const products = [10.00]
const holderReference = `holder-${Date.now()}`

export default function Checkout() {

  return (
    <div className="min-h-screen bg-gray-950 bg-[url('/payrails-gradient.png')] bg-cover bg-center bg-no-repeat">

      <header className="relative grid grid-cols-2 mx-auto max-w-7xl bg-blue-950 py-6 gap-x-16 bg-transparent px-8 pt-16 pb-10">
        <div className="mx-auto flex max-w-2xl px-4 w-full max-w-lg px-0">
          <a href="#">
            <Image
              alt="Payrails logo"
              src="/logo.png"
              width={64}
              height={8}
              className="h-8 w-auto"
              priority
            />
          </a>
        </div>
      </header>

      <main className="relative mx-auto grid max-w-7xl grid-cols-1 gap-x-16 grid-cols-1 px-8">
        <h1 className="sr-only">Checkout</h1>

        <PaymentAndShipping products={products} holderReference={holderReference} />
      </main>
    </div>
  )
}

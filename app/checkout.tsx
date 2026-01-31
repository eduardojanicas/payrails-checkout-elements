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

      <header className="relative mx-auto max-w-7xl bg-blue-950 py-6 lg:grid lg:grid-cols-2 lg:gap-x-16 lg:bg-transparent lg:px-8 lg:pt-16 lg:pb-10">
        <div className="mx-auto flex max-w-2xl px-4 lg:w-full lg:max-w-lg lg:px-0">
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

      <main className="relative mx-auto grid max-w-7xl grid-cols-1 gap-x-16 lg:grid-cols-1 lg:px-8">
        <h1 className="sr-only">Checkout</h1>

        <PaymentAndShipping products={products} holderReference={holderReference} />
      </main>
    </div>
  )
}

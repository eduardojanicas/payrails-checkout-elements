"use client";
// Checkout (Entry Point)
// Renders an order summary and the payment section. All Payrails logic lives
// in the PaymentAndShipping component + its hook.

import '@payrails/web-sdk/payrails-styles.css'
import OrderSummary from './components/OrderSummary'
import PaymentAndShipping from './components/PaymentAndShipping'
import Image from 'next/image'

// Element mounting & API calls handled in /components/PaymentAndShipping & /hooks/usePayrailsElements.

const products = [
  {
    id: 1,
    name: 'Portugal 25/26 Special Edition Jersey Men',
    href: '#',
    price: '$99.95',
    color: 'Pantera black',
    size: 'L',
    imageSrc: 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_550,h_550/global/783894/19/mod01/fnd/EEA/fmt/png/Portugal-25/26-Special-Edition-Jersey-Men',
    imageAlt: 'On grey, a model poses with a red bag, wearing a patterned black shirt and wide beige trousers.',
  }
]
const holderReference = `holder-${Date.now()}`

export default function Checkout() {

  return (
    <div className="bg-white">
      {/* Background color split screen for large screens */}
      <div aria-hidden="true" className="fixed top-0 left-0 hidden h-full w-1/2 bg-white lg:block" />
      <div aria-hidden="true" className="fixed top-0 right-0 hidden h-full w-1/2 bg-blue-950 lg:block" />

      <header className="relative mx-auto max-w-7xl bg-blue-950 py-6 lg:grid lg:grid-cols-2 lg:gap-x-16 lg:bg-transparent lg:px-8 lg:pt-16 lg:pb-10">
        <div className="mx-auto flex max-w-2xl px-4 lg:w-full lg:max-w-lg lg:px-0">
          <a href="#">
            <Image
              alt="Payrails logo"
              src="/payrails.png"
              width={64}
              height={8}
              className="h-8 w-auto"
              priority
            />
          </a>
        </div>
      </header>

      <main className="relative mx-auto grid max-w-7xl grid-cols-1 gap-x-16 lg:grid-cols-2 lg:px-8">
        <h1 className="sr-only">Checkout</h1>

        <OrderSummary products={products} />
        <PaymentAndShipping products={products} holderReference={holderReference} />
      </main>
    </div>
  )
}

"use client"
/**
 * PaymentMethodSelector
 * ---------------------------------------------------------------------------
 * Presents available payment methods as horizontal tabs similar to Stripe's
 * Payment Element. Each tab displays an icon and label.
 */

import React from 'react'

export interface PaymentMethodOption<T extends string> {
  id: string
  value: T
  title: string
  icon?: React.ReactNode
}

interface PaymentMethodSelectorProps<T extends string> {
  methods: PaymentMethodOption<T>[]
  value: T | null
  onChange: (value: T) => void
}

// Payment method icons
const CardIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 10H22" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6 15H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const PayPalIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.773.773 0 0 1 .763-.64h6.15c2.037 0 3.668.424 4.85 1.261 1.217.862 1.832 2.14 1.832 3.803 0 .6-.068 1.186-.203 1.754-.61 2.59-2.08 4.267-4.37 4.98a9.632 9.632 0 0 1-2.87.398H8.51a.773.773 0 0 0-.763.64l-1.133 5.682a.641.641 0 0 1-.633.54h.095Z" fill="#003087"/>
    <path d="M19.314 8.6c-.61 2.59-2.08 4.267-4.37 4.98a9.632 9.632 0 0 1-2.87.398h-1.09l-.964 4.838a.641.641 0 0 1-.633.54H6.82l.037-.184.995-4.994a.773.773 0 0 1 .763-.64h2.586a9.632 9.632 0 0 0 2.87-.398c2.29-.713 3.76-2.39 4.37-4.98.135-.568.203-1.154.203-1.754 0-.493-.054-.956-.163-1.39.45.5.792 1.102 1.017 1.803.254.788.38 1.685.38 2.682 0 .6-.068 1.186-.203 1.754-.361 1.534-.982 2.77-1.86 3.699-.879.93-1.984 1.589-3.308 1.972a11.178 11.178 0 0 1-3.32.453H8.51" fill="#0070E0"/>
  </svg>
)

const PixIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.3 15.3L15.3 18.3C14.5 19.1 13.2 19.1 12.4 18.3L11.1 17L9.7 18.4L11 19.7C12.6 21.3 15.1 21.3 16.7 19.7L19.7 16.7L18.3 15.3Z" fill="#32BCAD"/>
    <path d="M5.7 8.7L8.7 5.7C9.5 4.9 10.8 4.9 11.6 5.7L12.9 7L14.3 5.6L13 4.3C11.4 2.7 8.9 2.7 7.3 4.3L4.3 7.3L5.7 8.7Z" fill="#32BCAD"/>
    <path d="M19.7 7.3L16.7 4.3C15.1 2.7 12.6 2.7 11 4.3L9.7 5.6L11.1 7L12.4 5.7C13.2 4.9 14.5 4.9 15.3 5.7L18.3 8.7L19.7 7.3Z" fill="#32BCAD"/>
    <path d="M4.3 16.7L7.3 19.7C8.9 21.3 11.4 21.3 13 19.7L14.3 18.4L12.9 17L11.6 18.3C10.8 19.1 9.5 19.1 8.7 18.3L5.7 15.3L4.3 16.7Z" fill="#32BCAD"/>
    <path d="M12 9.2L9.2 12L12 14.8L14.8 12L12 9.2Z" fill="#32BCAD"/>
  </svg>
)

const UpiIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6.5L7.5 2L12 6.5L7.5 11L3 6.5Z" fill="#097939"/>
    <path d="M12 17.5L16.5 13L21 17.5L16.5 22L12 17.5Z" fill="#ED752E"/>
    <path d="M7.5 11L12 6.5L16.5 11L12 15.5L7.5 11Z" fill="#097939"/>
  </svg>
)

export const PaymentMethodIcons: Record<string, React.FC> = {
  card: CardIcon,
  paypal: PayPalIcon,
  pix: PixIcon,
  upi: UpiIcon,
}

export const PaymentMethodSelector = <T extends string>({ methods, value, onChange }: PaymentMethodSelectorProps<T>) => {
  return (
    <fieldset>
      <legend className="sr-only">Payment type</legend>

      <div className="flex gap-2 p-1">
        {methods.map((pm) => {
          const isSelected = value === pm.value
          const IconComponent = PaymentMethodIcons[pm.value] || CardIcon

          return (
            <div key={pm.id} className="flex-1">
              <input
                id={pm.id}
                name="payment-type"
                type="radio"
                className="peer sr-only"
                checked={isSelected}
                onChange={() => onChange(pm.value)}
              />

              <label
                htmlFor={pm.id}
                className={`
                  flex flex-col justify-between items-start p-2.5 cursor-pointer h-[96px]
                  rounded-lg border transition-all bg-gray-950 text-gray-300
                  ${isSelected
                    ? 'border-[#1447e6]'
                    : 'border-[#303030]'
                  }
                `}
              >
                <div className={`
                  flex items-center justify-center w-7 h-7 rounded-md
                  ${isSelected ? 'bg-[#2a3a5a]' : 'bg-[#252b3b]'}
                `}>
                  {pm.icon || <IconComponent />}
                </div>
                <span className="text-xs font-medium whitespace-nowrap">{pm.title}</span>
              </label>
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}

export default PaymentMethodSelector

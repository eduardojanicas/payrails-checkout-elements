"use client"
/**
 * PaymentMethodSelector
 * ---------------------------------------------------------------------------
 * Presents available payment methods as radio buttons. Keeps HTTP/API concerns
 * out of the UI layer; caller decides which methods to show and handles state.
 *
 * Accessibility: Legend is visually hidden (sr-only) but announced to screen readers.
 */

export interface PaymentMethodOption<T extends string> {
  id: string
  value: T
  title: string
}

interface PaymentMethodSelectorProps<T extends string> {
  methods: PaymentMethodOption<T>[]
  value: T | null
  onChange: (value: T) => void
}

export const PaymentMethodSelector = <T extends string>({ methods, value, onChange }: PaymentMethodSelectorProps<T>) => {
  return (
    <div>
      {/* STEP 1a: Payment method selector component */}
      <fieldset className="mt-4">
        <legend className="sr-only">Payment type</legend>
        <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
          {methods.map((pm) => (
            <div key={pm.id} className="flex items-center">
              <input
                id={pm.id}
                name="payment-type"
                type="radio"
                className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-blue-600 checked:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden"
                checked={value === pm.value}
                onChange={() => onChange(pm.value)}
              />
              <label htmlFor={pm.id} className="ml-3 block text-sm/6 font-medium text-gray-700">
                {pm.title}
              </label>
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

export default PaymentMethodSelector

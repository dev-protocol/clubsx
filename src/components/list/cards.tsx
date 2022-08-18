/*
  This example requires Tailwind CSS v2.0+

  This example requires some changes to your config:

  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/aspect-ratio'),
    ],
  }
  ```
*/

import { products } from '@constants/products'

type Params = {
  currency: 'ETH' | 'USD'
}

export default function Cards({ currency }: Params) {
  return (
    <div className="bg-black">
      <div className="mx-auto max-w-2xl py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative flex flex-col overflow-hidden rounded-[32px] border border-gray-500 bg-white"
            >
              <div className="aspect-w-3 aspect-h-4 bg-gray-200 group-hover:opacity-75 sm:aspect-none sm:h-96">
                <img
                  src={product.payload}
                  alt={product.imageAlt}
                  className="h-full w-full object-cover object-center sm:h-full sm:w-full"
                />
              </div>
              <div className="flex flex-1 flex-col space-y-2 p-4">
                <h3 className="font-Syne mt-[32px] text-4xl font-normal text-gray-900">
                  {/* TODO: Link when using fiat */}
                  <a
                    href={
                      currency === 'ETH' ? `buy/${product.id}?input=eth` : '#'
                    }
                  >
                    <span aria-hidden="true" className="absolute inset-0" />
                    {product.name}
                  </a>
                </h3>
                <div className="flex flex-1 flex-col justify-end">
                  <p className="font-Syne mt-[10px] text-sm font-normal text-black">
                    Price
                  </p>
                  <p className="font-DMSans text-2xl font-normal text-[#000000]">
                    {currency === 'USD'
                      ? `$${product.priceUsd.toLocaleString()}`
                      : `Ξ${product.priceEth}`}
                  </p>
                  <p className="font-Syne mt-[10px] text-lg font-normal text-[#88AEFF]">
                    {product.left} left
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

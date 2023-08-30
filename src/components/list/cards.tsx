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

import React from 'react'
import type { Membership } from '@plugins/memberships'

export type ExtendedProducts = (Membership & { purchaseLink?: string })[]

type Params = {
  products: ExtendedProducts
}

export default function Cards({ products }: Params) {
  return (
    <div>
      <div className="mx-auto max-w-2xl px-6 md:max-w-7xl md:px-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 md:gap-x-8 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="group	relative flex flex-col overflow-hidden rounded-[32px] border border-gray-500 bg-white text-left hover:cursor-pointer"
            >
              <div className="bg-gray-200 group-hover:opacity-75">
                <img
                  src={product.imageSrc}
                  alt={product.name}
                  className="h-auto w-full object-cover object-center sm:h-full sm:w-full"
                />
              </div>
              <div className="flex flex-1 flex-col space-y-2 p-4">
                <h3 className="font-Syne text-4xl font-normal text-gray-900">
                  <a rel="prefetch" href={`buy-with-cc/${product.id}`}>
                    <span aria-hidden="true" className="absolute inset-0" />
                    {product.name}
                  </a>
                </h3>
                {product.description && (
                  <p className="font-Syne mt-[10px] text-sm font-normal text-black">
                    {product.description}
                  </p>
                )}
                <div className="flex flex-1 flex-col justify-end">
                  <p className="font-Syne mt-[10px] text-sm font-normal text-black">
                    Price
                  </p>
                  <p className="font-DMSans text-2xl font-normal text-[#000000]">
                    {`${Number(product.price).toLocaleString()} ${
                      product.currency
                    }`}
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

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

import React, {
  MouseEvent,
  ChangeEvent,
  useState,
  useEffect,
  useMemo,
} from 'react'
import type { Product } from '@constants/products'
import { version } from '@crossmint/client-sdk-react-ui/package.json'
import {
  Currency,
  clientNames,
  crossmintModalService,
  crossmintPayButtonService,
} from '@crossmint/client-sdk-base'
import { utils } from 'ethers'
import { onMountClient } from '@devprotocol/clubs-core/events'

export type ExtendedProducts = (Product & { purchaseLink?: string })[]

type Params = {
  cm: {
    projectId: string
    collectionId: string
    environment?: string
  }
  paymentCurrency?: Currency
  products: ExtendedProducts
}

export default function Cards({ cm, paymentCurrency, products }: Params) {
  const [connecting, setConnecting] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [account, setAccount] = useState<string>()
  const [email, setEmail] = useState<string>('')

  console.log({ paymentCurrency, connecting, selectedId, account, email })

  const { connect } = useMemo(
    () =>
      crossmintModalService({
        clientId: cm.collectionId,
        projectId: cm.projectId,
        environment: cm.environment,
        setConnecting,
        locale: 'en-US',
        currency: paymentCurrency ?? 'USD',
        libVersion: version,
        showOverlay: true,
        clientName: clientNames.reactUi,
      }),
    [cm, paymentCurrency],
  )
  const { handleClick } = useMemo(
    () =>
      crossmintPayButtonService({
        connecting,
        locale: 'en-US',
      }),
    [connecting],
  )

  const _handleClick = useMemo(
    () =>
      (opt: { product: Product }) =>
      (event: MouseEvent<HTMLButtonElement>) => {
        setSelectedId(opt.product.id)
        handleClick(event, () => {
          connect(
            {
              type: 'erc-721', // Required param of Crossmint
              quantity: '1', // Required param of Crossmint
              totalPrice: '1', // TODO: Replace the value to a calculated MATIC amount in YEN
              /**
               * TODO: Change the following options to match the new SwapAndStake contract interface.
               */
              _payload: utils.keccak256(opt.product.payload),
            },
            account, // Destination EOA
            account ? undefined : email, // Destination Email
          )
        })
      },
    [account, email],
  )

  const _handleChange = useMemo(
    () => (event: ChangeEvent<HTMLInputElement>) =>
      setEmail(event.currentTarget.value),
    [],
  )

  useEffect(() => {
    onMountClient(async () => {
      const [{ connection }] = await Promise.all([
        import('@devprotocol/clubs-core/connection'),
      ])
      connection().account.subscribe(setAccount)
    })
  })

  return (
    <div>
      <div className="mx-auto max-w-2xl px-6 md:max-w-7xl md:px-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 md:gap-x-8 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className={`text-left	group relative flex flex-col overflow-hidden rounded-[32px] border border-gray-500 bg-white hover:cursor-pointer ${
                connecting && selectedId === product.id && 'animate-pulse'
              }`}
            >
              <div className="bg-gray-200 group-hover:opacity-75">
                <img
                  src={product.imageSrc}
                  alt={product.imageAlt}
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

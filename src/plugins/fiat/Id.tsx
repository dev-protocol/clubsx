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
  type PayButtonConfig,
} from '@crossmint/client-sdk-base'
import { JsonRpcProvider, ZeroAddress, keccak256, parseUnits } from 'ethers'
import { onMountClient } from '@devprotocol/clubs-core/events'
import type { CMValues } from '.'
import BigNumber from 'bignumber.js'

export type ExtendedProducts = (Product & { purchaseLink?: string })[]

type Params = {
  cm: CMValues
  product: Product
  rpcUrl: string
  propertyAddress: string
}

export default ({ cm, product, rpcUrl, propertyAddress }: Params) => {
  const [connecting, setConnecting] = useState(false)
  const [usingWallet, setUsingWallet] = useState(true)
  const [account, setAccount] = useState<string>()
  const [email, setEmail] = useState<string>('')

  console.log({ connecting, account, email })

  const { connect } = useMemo(
    () =>
      crossmintModalService({
        clientId: cm.collectionId,
        projectId: cm.projectId,
        environment: cm.environment,
        setConnecting,
        locale: 'en-US',
        currency: 'USD',
        libVersion: version,
        showOverlay: true,
        clientName: clientNames.reactUi,
      }),
    [cm],
  )
  const { handleClick } = useMemo(
    () =>
      crossmintPayButtonService({
        connecting,
        locale: 'en-US',
      }),
    [connecting],
  )
  const provider = useMemo(() => new JsonRpcProvider(rpcUrl), [rpcUrl])
  const priceString = useMemo(
    () => new BigNumber(product.price).toFixed(),
    [product.price],
  )

  const _handleClick = useMemo(
    () => (event: MouseEvent<HTMLButtonElement>) =>
      handleClick(event, async () => {
        const tsFromBlock = (await provider.getBlock('latest'))?.timestamp
        const deadline =
          600 + (tsFromBlock ?? Math.floor(new Date().getTime() / 1000))
        const props: PayButtonConfig = {
          type: 'erc-721', // Required param of Crossmint
          quantity: '1', // Required param of Crossmint
          totalPrice: priceString, // Required param of Crossmint
          /**
           * the below values are additional args
           */
          _token: cm.args.token,
          _path: cm.args.path,
          _property: propertyAddress,
          _amount: parseUnits(priceString, 6).toString(), // USDC has 6 decimal points
          _amountOut: '0', // TODO: This value should be calculated with the result of `getEstimatedTokensForDev`
          _deadline: String(deadline),
          _payload:
            typeof product.payload === 'string'
              ? product.payload
              : keccak256(product.payload),
          _gatewayAddress: product.fee?.beneficiary ?? ZeroAddress,
          _gatewayFee: new BigNumber(product.fee?.percentage ?? 0)
            .times(10000)
            .dp(0)
            .toFixed(),
        }
        console.log({ props })
        return connect(
          props,
          account, // Destination EOA
          account ? undefined : email, // Destination Email
        )
      }),
    [account, email],
  )

  const _handleChange = useMemo(
    () => (event: ChangeEvent<HTMLInputElement>) =>
      setEmail(event.currentTarget.value),
    [],
  )

  const _toggleUsingWallet = useMemo(
    () => () => {
      const next = !usingWallet
      setUsingWallet(next)
      next && setEmail('')
    },
    [usingWallet],
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
    <>
      <div className="relative mx-auto mb-12 grid items-start rounded-xl bg-black p-4 shadow lg:container lg:mt-12 lg:grid-cols-2 lg:gap-12">
        <section className="flex flex-col gap-8">
          <h2 className="text-4xl font-bold">Buy</h2>
          <div className="grid gap-4">
            {usingWallet && (
              <>
                <h3 className="mb-4 text-2xl">Wallet</h3>
                {account && (
                  <p className="truncate rounded-md border-[3px] border-transparent bg-gray-500/60 p-2 text-xl">
                    {account}
                  </p>
                )}
                {!account && (
                  <p className="animate-pulse rounded-md border-[3px] border-transparent bg-gray-500/60 p-2 text-center	text-xl">
                    Please connect a wallet
                  </p>
                )}
                <button
                  onClick={_toggleUsingWallet}
                  className="rounded-full bg-gray-800 p-1"
                >
                  Or use email instead
                </button>
              </>
            )}
            {!usingWallet && (
              <>
                <h3 className="mb-4 text-2xl">Email</h3>
                <input
                  className="rounded-md border-[3px] border-gray-500/60 bg-gray-500/60 p-2 text-xl outline-0 transition-colors focus:border-gray-300"
                  placeholder="Enter your email"
                  type="email"
                  onChange={_handleChange}
                  value={email}
                />
                <button
                  onClick={_toggleUsingWallet}
                  className="rounded-full bg-gray-800 p-1"
                >
                  Or use wallet
                </button>
              </>
            )}
          </div>
          <button
            className="my-8 w-full rounded-full border-[3px] border-blue-600 bg-blue-600/40 p-2 px-4 text-2xl transition-colors hover:bg-blue-600 disabled:border-gray-400 disabled:bg-gray-600 disabled:text-gray-400"
            onClick={_handleClick}
            disabled={
              connecting ||
              (usingWallet && !account) ||
              (!usingWallet && !email)
            }
          >
            Checkout
          </button>
        </section>
        <section className="flex flex-col gap-6">
          <div className="rounded-lg border border-white/20 bg-white/10 p-4">
            <img
              src={product.imageSrc}
              alt={product.imageAlt}
              className="h-auto w-full rounded object-cover object-center sm:h-full sm:w-full"
            />
          </div>
          <div>
            <h3 className="text-sm text-white/50">
              <span>{product.name}</span>
            </h3>
            <p className="mt-2 text-2xl">
              {`${Number(product.price).toLocaleString()} ${product.currency}`}
            </p>
            {product.description && (
              <p className="mt-6 text-xl text-white/80">
                {product.description}
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  )
}

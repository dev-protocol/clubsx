import React, {
  MouseEvent,
  ChangeEvent,
  useState,
  useEffect,
  useMemo,
} from 'react'
import type { Membership } from '@plugins/memberships'
import { version } from '@crossmint/client-sdk-react-ui/package.json'
import {
  Currency,
  clientNames,
  crossmintModalService,
  crossmintPayButtonService,
  type MintConfigs,
} from '@crossmint/client-sdk-base'
import { JsonRpcProvider, ZeroAddress, keccak256, parseUnits } from 'ethers'
import { onMountClient } from '@devprotocol/clubs-core/events'
import type { CMValues } from '.'
import BigNumber from 'bignumber.js'

export type ExtendedProducts = (Membership & { purchaseLink?: string })[]

type Params = {
  cm: CMValues
  product: Membership
  rpcUrl: string
  propertyAddress: string
  baseUrl: string
}

const genCallbackURLs = (
  viewerUrl: string,
  givenBaseUrl: string,
  isSaaS: boolean,
): URL => {
  const url = new URL(viewerUrl)
  if (!isSaaS) {
    return url
  }
  const page = new URL(new URL(givenBaseUrl).origin)
  page.pathname = '/redirect/'
  const redirect = new URL(page)
  redirect.searchParams.set('redirect', url.toString())
  return redirect
}

export default ({
  cm,
  product,
  rpcUrl,
  propertyAddress,
  baseUrl: givenBaseUrl,
}: Params) => {
  const [connecting, setConnecting] = useState(false)
  const [usingWallet, setUsingWallet] = useState(true)
  const [account, setAccount] = useState<string>()
  const [email, setEmail] = useState<string>('')
  const [baseUrl, setBaseUrl] = useState<string>()
  const [isClubsx, setIsClubsx] = useState<boolean>(false)
  const callbackURL =
    baseUrl && genCallbackURLs(baseUrl, givenBaseUrl, isClubsx)

  console.log({ connecting, account, email })

  useEffect(() => {
    setBaseUrl(`${new URL(location.href).origin}/fiat/result`)
    setIsClubsx(givenBaseUrl !== location.href)
  })

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
        successCallbackURL: callbackURL?.toString(),
        failureCallbackURL: callbackURL?.toString(),
      }),
    [cm, callbackURL],
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
        const props: MintConfigs = {
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
        console.log({ props, email, account })
        return connect(
          props,
          usingWallet ? account : undefined, // Destination EOA
          !usingWallet ? email : undefined, // Destination Email
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
      <div className="grid gap-4">
        {usingWallet && (
          <>
            <h3 className="mb-4 text-xl">Destination wallet</h3>
            {account && (
              <p className="truncate rounded-md border-[3px] border-transparent bg-gray-500/60 p-2 text-xl">
                {account}
              </p>
            )}
            {!account && (
              <p className="animate-pulse rounded-md border-[3px] border-transparent bg-gray-500/60 p-2 text-center text-xl	text-white">
                Please connect a wallet
              </p>
            )}
            <button
              onClick={_toggleUsingWallet}
              className="rounded-full bg-gray-800 p-1 text-white"
            >
              Or use email instead
            </button>
          </>
        )}
        {!usingWallet && (
          <>
            <h3 className="mb-4 text-xl">Destination email</h3>
            <input
              className="rounded-md border-[3px] border-gray-500/60 bg-gray-500/60 p-2 text-xl outline-0 transition-colors focus:border-gray-300"
              placeholder="Enter your email"
              type="email"
              onChange={_handleChange}
              value={email}
            />
            <button
              onClick={_toggleUsingWallet}
              className="rounded-full bg-gray-800 p-1 text-white"
            >
              Or use wallet
            </button>
            <p>
              NFT as a membership will be emailed to you and will be activated
              once you withdraw it in your wallet.
            </p>
          </>
        )}
      </div>
      <button
        className="my-8 w-full rounded-full border-[3px] border-blue-600 bg-blue-600/40 p-2 px-4 text-2xl transition-colors hover:bg-blue-600 disabled:border-gray-400 disabled:bg-gray-600 disabled:text-gray-400"
        onClick={_handleClick}
        disabled={
          connecting || (usingWallet && !account) || (!usingWallet && !email)
        }
      >
        Checkout
      </button>
    </>
  )
}

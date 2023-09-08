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
  const host = new URL(givenBaseUrl).host
  const [, ...primaryHostname] = host.split('.')
  const primaryHost = primaryHostname.join('.')
  const page = new URL(new URL(givenBaseUrl).origin.replace(host, primaryHost))
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

  console.log({ connecting, account, email, callbackURL })

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
            <span className="hs-form-field is-large is-filled">
              <input
                className={`hs-form-field__input ${
                  !account && 'animate-pulse'
                }`}
                disabled
                value={account ? account : 'Please connect a wallet'}
              />
            </span>
            <button
              onClick={_toggleUsingWallet}
              className="hs-button is-small is-fullwidth is-outlined"
            >
              Or use email instead
            </button>
          </>
        )}
        {!usingWallet && (
          <>
            <h3 className="mb-4 text-xl">Destination email</h3>

            <span className="hs-form-field is-large is-filled">
              <input
                className="hs-form-field__input"
                placeholder="Enter your email"
                type="email"
                onChange={_handleChange}
                value={email}
              />
            </span>
            <button
              onClick={_toggleUsingWallet}
              className="hs-button is-small is-fullwidth is-outlined"
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
        className="hs-button is-large is-fullwidth is-filled is-native-blue my-8"
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

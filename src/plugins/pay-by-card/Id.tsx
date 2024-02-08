import {
  type MouseEvent,
  type ChangeEvent,
  useState,
  useEffect,
  useMemo,
} from 'react'
import type { PricedMembership } from '@plugins/memberships'
import { version } from '@crossmint/client-sdk-react-ui/package.json'
import {
  clientNames,
  crossmintModalService,
  crossmintPayButtonService,
  type MintConfigs,
} from '@crossmint/client-sdk-base'
import { JsonRpcProvider, ZeroAddress, keccak256, parseUnits } from 'ethers'
import { onMountClient } from '@devprotocol/clubs-core'
import type { CMValues } from '.'
import BigNumber from 'bignumber.js'

export type ExtendedProducts = (PricedMembership & { purchaseLink?: string })[]

type Params = {
  cm: CMValues
  product: PricedMembership
  rpcUrl: string
  propertyAddress: string
  baseUrl: string
}

const genCallbackURLs = (viewerUrl: string): URL => {
  const redirect = new URL('https://clubs.place/redirect/')
  redirect.searchParams.set('redirect', viewerUrl)
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
  const [baseUrl, setBaseUrl] = useState<string>()
  const callbackURL = baseUrl && genCallbackURLs(baseUrl)

  console.log({ connecting, account, callbackURL })
  useEffect(() => {
    setBaseUrl(new URL('/fiat/result', new URL(givenBaseUrl).origin).toString())
  }, [givenBaseUrl])

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
        console.log({ props, account })
        return connect(
          props,
          usingWallet ? account : undefined, // Destination EOA
        )
      }),
    [account],
  )

  const _toggleUsingWallet = useMemo(
    () => () => {
      const next = !usingWallet
      setUsingWallet(next)
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
        <h3 className="mb-4 text-xl">Destination</h3>
        {usingWallet && (
          <>
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
            <button
              onClick={_toggleUsingWallet}
              className="hs-button is-small is-fullwidth is-outlined"
            >
              Or use wallet
            </button>
            <p>
              NFT as a membership will be emailed to your address that input on
              the next page and will be activated once you withdraw it for your
              wallet.
            </p>
          </>
        )}
      </div>
      <button
        className="hs-button is-large is-fullwidth is-filled is-native-blue my-8"
        onClick={_handleClick}
        disabled={connecting || (usingWallet && !account)}
      >
        Checkout
      </button>
    </>
  )
}

import type { APIRoute } from 'astro'
import fetch from 'cross-fetch'
import {
  AbiCoder,
  ZeroAddress,
  keccak256,
  parseUnits,
  randomBytes,
} from 'ethers'
import BigNumber from 'bignumber.js'
import { abi } from './fulfillment'
import type { ComposedItem } from '..'
import { whenNotError, whenNotErrorAll } from '@devprotocol/util-ts'
import { createClient } from 'redis'
import { generateFulFillmentParamsId } from '../utils/gen-key'
import { bytes32Hex } from '@fixtures/data/hexlify'
import { getTokenAddress } from '@fixtures/dev-kit'

const { POP_SERVER_KEY, REDIS_URL, REDIS_USERNAME, REDIS_PASSWORD } =
  import.meta.env
const AUTH_STRING = Buffer.from(`${POP_SERVER_KEY}:`).toString('base64')

export type Success = {
  payment_key: string // '28GTzdVOZNeImaHMDeQF1319'
  result_code: string //'R000'
  status: 'success'
  message: string //'"Payment Key" has been generated successfully'
  payment_key_expiry_time: string //'20200401000000'
}

export type Failure = {
  result_code: string //'RC01'
  status: 'failure'
  message: string //'Invalid "Order ID"'
}

export enum PaymentTypes {
  Card = 'card',
  CVS = 'cvs',
  Bank = 'bank',
}

export enum CVSPaymentSubTypes {
  Sej = 'sej',
  Lawson = 'lawson',
  Famima = 'famima',
  Econ = 'econ',
  Other = 'other',
}

export enum BankPaymentSubTypes {
  ATM = 'atm',
}

export enum SaveCardTypes {
  Always = 'always',
  Optional = 'optional',
}

export type PaymentKeyOptions = {
  order_id: string
  gross_amount: number // in YEN
  shipping_amount?: number
  dummy?: boolean
  capture?: boolean
  payment_key_expiry_duration?: number // minutes
  success_url?: string
  failure_url?: string
  incomplete_url?: string
  push_url?: string
  enabled_payment_types?: PaymentTypes[]
  card?: {
    mpi?: boolean
    paynow_account_id?: string
    save_card?: SaveCardTypes
    skip_card_selection?: boolean
    '3ds_version'?: number // 1 or 2
  }
  cvs?: {
    payment_sub_type: CVSPaymentSubTypes
    payment_expiry_duration?: number
    payment_expiry_date?: string
  }[]
  bank?: {
    payment_type?: {
      payment_sub_type: BankPaymentSubTypes
      payment_expiry_duration?: number
    }[]
    contents: string
    contents_kana: string
  }
  email?: {
    customer_name?: string
    customer_email_address?: string
  }
  items?: {
    id: string
    name: string
    price: number
    quantity: number
  }[]
  custom_message?: {
    show_items_additional_message?: boolean
    items_additional_message?: string
  }
}

/**
 * This endpoint is expected to be called with the following parameters:
 * ?id={MEMBERSHIP_ID}&eoa={USER_EOA}&email.customer_name={USER_NAME}&email.customer_email_address={USER_EMAIL_ADDRESS}&dummy={OPTIONAL_BOOLEAN}
 */
export const get: ({
  propertyAddress,
  chainId,
  items,
}: {
  propertyAddress: string
  chainId: number
  items: ComposedItem[]
}) => APIRoute =
  ({ propertyAddress, chainId, items: _items }) =>
  async ({ url }) => {
    /**
     * Get request parameters.
     */
    const membershipId = url.searchParams.get('id')
    const eoa = url.searchParams.get('eoa')
    const dummy = url.searchParams.get('dummy') === 'true'
    const customer_name = url.searchParams.get('email.customer_name')
    const customer_email_address = url.searchParams.get(
      'email.customer_email_address',
    )

    /**
     * Get the expected overridden membership and its source.
     */
    const membership =
      _items.find((mem) => mem.id === membershipId) ??
      new Error('Missing item ID')

    const payloadHex = whenNotError(membership, (mem) =>
      typeof mem.payload === 'string' ? mem.payload : keccak256(mem.payload),
    )

    const sourcePaymentToken = whenNotError(membership, ({ source }) =>
      source.currency === 'MATIC' && (chainId === 137 || chainId === 80001)
        ? ZeroAddress
        : getTokenAddress(source.currency, chainId),
    )

    /**
     * Create arguments required by the fulfillment flow as ABI-encoded values.
     */
    const abiEncoder = AbiCoder.defaultAbiCoder()
    const abiParams = whenNotError(membership, (mem) => {
      const amount = parseUnits(
        mem.source.price.toString(),
        mem.source.currency === 'USDC' ? 6 : 18,
      )
      return [
        eoa,
        propertyAddress,
        payloadHex,
        sourcePaymentToken,
        amount,
        mem.source.fee?.beneficiary ?? ZeroAddress,
        new BigNumber(amount.toString())
          .times(mem.source.fee?.percentage ?? 0)
          .dp(0, 1)
          .toFixed(),
      ]
    })
    const abiEncodedParamsForFulfilment = whenNotError(abiParams, (_params) =>
      abiEncoder.encode(abi, _params),
    )
    console.log({ abiParams })

    /**
     * Create other parameters.
     */
    const orderUniqueKey = abiEncoder.encode(
      ['address', 'bytes32', 'bytes32'],
      [eoa, payloadHex, keccak256(randomBytes(8))],
    )
    const order_id = `ORDER-${keccak256(orderUniqueKey)}`
    const gross_amount = whenNotError(membership, ({ price }) => price.yen)
    const payment_key_expiry_duration = 1440 // = 1440 minutes
    const push_destination = new URL(
      `/api/devprotocol:clubs:plugin:clubs-payments/fulfillment`,
      url.origin.replace('http:', 'https:'),
    ).toString()

    const client = await whenNotError(
      createClient({
        url: REDIS_URL,
        username: REDIS_USERNAME ?? '',
        password: REDIS_PASSWORD ?? '',
      }),
      (db) =>
        db
          .connect()
          .then(() => db)
          .catch((err) => new Error(err)),
    )

    const paramsSaved = await whenNotErrorAll(
      [client, abiEncodedParamsForFulfilment],
      ([db, params]) => db.set(generateFulFillmentParamsId(order_id), params),
    )

    const push_url = whenNotError(paramsSaved, () => push_destination)
    const enabled_payment_types = [PaymentTypes.Card]
    const card = {
      '3ds_version': 2,
    }
    const email =
      customer_name && customer_email_address
        ? {
            customer_name,
            customer_email_address,
          }
        : undefined
    const items = whenNotError(membership, (mem) => [
      {
        id: `ITEM-${bytes32Hex(mem.payload).replace(
          /0x(.{4}).*(.{4}$)/,
          '$1-$2',
        )}`,
        name: mem.source.name,
        price: mem.price.yen,
        quantity: 1,
      },
    ])

    const options = whenNotErrorAll(
      [gross_amount, push_url, items],
      ([_gross_amount, _push_url, _items]) =>
        ({
          dummy,
          order_id,
          gross_amount: _gross_amount,
          payment_key_expiry_duration,
          push_url: _push_url,
          enabled_payment_types,
          card,
          email,
          items: _items,
        }) as PaymentKeyOptions,
    )

    console.log({ options })

    /**
     * Post them and return the content.
     *
     */
    const paymentKey = await whenNotError(options, (opts) =>
      fetch('https://pay.veritrans.co.jp/pop/v1/payment-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Basic ${AUTH_STRING}`,
        },
        body: JSON.stringify(opts),
      }).catch((err) => new Error(err)),
    )

    const result = await whenNotError(paymentKey, (res) =>
      res
        .text()
        .then((x) => x as string)
        .catch((err) => new Error(err)),
    )

    return result instanceof Error
      ? new Response(
          JSON.stringify({
            result_code: 'E1',
            status: 'failure',
            message: result.message,
          }),
          { status: 400 },
        )
      : new Response(result, { status: 200 })
  }

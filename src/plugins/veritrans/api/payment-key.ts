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

const { POP_SERVER_KEY, PUBLIC_POP_CLIENT_KEY } = import.meta.env
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
    '3ds_version'?: 1 | 2
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
  async ({ request, url }) => {
    console.log('********', url)
    /**
     * Get request parameters.
     */
    const membershipId = url.searchParams.get('id')
    const eoa = url.searchParams.get('eoa')
    const dummy = Boolean(url.searchParams.get('dummy'))
    const customer_name = url.searchParams.get('email.customer_name')
    const customer_email_address = url.searchParams.get(
      'email.customer_email_address',
    )

    console.log({
      membershipId,
      eoa,
      dummy,
      customer_name,
      customer_email_address,
    })

    /**
     * Get the expected overridden membership and its source.
     */
    const membership = _items.find((mem) => mem.id === membershipId)

    if (membership === undefined) {
      return {
        body: JSON.stringify({
          result_code: 'E1',
          status: 'failure',
          message: 'Missing item ID',
        }),
      }
    }

    const payloadHex =
      typeof membership.payload === 'string'
        ? membership.payload
        : keccak256(membership.payload)

    const sourcePaymentToken =
      chainId === 137
        ? membership.source.currency === 'ETH'
          ? '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'
          : ZeroAddress
        : chainId === 80001
        ? membership.source.currency === 'ETH'
          ? '0x3c8d6A6420C922c88577352983aFFdf7b0F977cA'
          : ZeroAddress
        : ZeroAddress

    /**
     * Create arguments required by the fulfillment flow as ABI-encoded values.
     */
    const abiEncoder = AbiCoder.defaultAbiCoder()
    const abiEncodedParamsForFulfilment = abiEncoder.encode(abi, [
      eoa,
      propertyAddress,
      payloadHex,
      sourcePaymentToken,
      parseUnits(
        membership.source.price.toString(),
        membership.source.currency === 'USDC' ? 6 : 18,
      ),
      membership.source.fee?.beneficiary ?? ZeroAddress,
      new BigNumber(membership.source.fee?.percentage ?? 0)
        .times(10000)
        .toFixed(0),
    ])

    /**
     * Create other parameters.
     */
    const orderUniqueKey = abiEncoder.encode(
      ['address', 'bytes32', 'bytes32'],
      [eoa, payloadHex, keccak256(randomBytes(8))],
    )
    const order_id = `ORDER-${keccak256(orderUniqueKey)}`
    const gross_amount = membership.price.yen
    const payment_key_expiry_duration = 1440 // = 1440 minutes
    const push_url = new URL(
      `/api/devprotocol:clubs:plugin:veritrans/fulfillment/?params=${abiEncodedParamsForFulfilment}`,
      new URL(request.url).origin,
    ).toString()
    const enabled_payment_types = [PaymentTypes.Card]
    const email =
      customer_name && customer_email_address
        ? {
            customer_name,
            customer_email_address,
          }
        : undefined
    const items = [
      {
        id: `ITEM-${membership.id}`,
        name: membership.source.name,
        price: membership.price.yen,
        quantity: 1,
      },
    ]
    const custom_message = {
      show_items_additional_message: true,
      items_additional_message: membership.source.description,
    }

    const options: PaymentKeyOptions = {
      dummy,
      order_id,
      gross_amount,
      payment_key_expiry_duration,
      // push_url,
      enabled_payment_types,
      email,
      items,
      custom_message,
    }

    console.log({ options })

    /**
     * Post them and return the content.
     *
     */
    const res = await fetch('https://pay.veritrans.co.jp/pop/v1/payment-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Basic ${AUTH_STRING}`,
      },
      body: JSON.stringify(options),
    }).catch((err) => err)

    const body = await res.text()

    return {
      body,
    }
  }

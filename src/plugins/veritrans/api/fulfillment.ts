import {
  whenNotError,
  type ErrorOr,
  whenNotErrorAll,
  whenDefined,
} from '@devprotocol/util-ts'
import type { APIRoute } from 'astro'
import fetch from 'cross-fetch'
import { sha512 } from 'crypto-hash'
import { AbiCoder } from 'ethers'
import { toPairs, tryCatch } from 'ramda'
import { Status, createRequest, fetchWebhook } from '../utils/webhooks'
import { createClient } from 'redis'
import { generateFulFillmentParamsId } from '../utils/gen-key'

const { POP_SERVER_KEY, SEND_DEVPROTOCOL_API_KEY } = import.meta.env

export const abi = [
  'address _mintFor',
  'address _propertyAddress',
  'bytes32 _payload',
  'address _paymentToken',
  'uint256 _paymentAmount',
  'address _feeBeneficiary',
  'uint256 _feePercentage',
]

export type RequestBody = {
  merchant_id: string
  order_id: string
  status: 'success' | 'failure'
  result_code: string
  m_status?: 'success' | 'failure' | 'pending'
  v_result_code?: string
  transaction_datetime?: string
  dummy: boolean
  signature: string
} & {
  payment_type: 'card'
  acquirer_code?: string
  auth_code?: string
  masked_card_number?: string
}

const headers = {
  'content-type': 'application/json;charset=UTF-8',
}

/**
 * This endpoint is expected to be called with the following parameters:
 * ?params={ABI_ENCODED_PARAMS}
 */
export const post: ({
  chainId,
  rpcUrl,
  webhookOnFulfillment,
}: {
  chainId: number
  rpcUrl: string
  webhookOnFulfillment?: string
}) => APIRoute =
  ({ chainId, rpcUrl, webhookOnFulfillment }) =>
  async ({ request, url }) => {
    // Step 1 - Read all the parameters and their values
    const verification$1: ErrorOr<RequestBody> = await request
      .json()
      .catch((err) => new Error(err))
    console.log(1, verification$1)

    // Step 2a - Convert all string arrays into comma separated values
    const verification$2 = whenNotError(verification$1, (res) =>
      toPairs(res).map(([key, value]) => {
        const value_ = Array.isArray(value) ? value.join(',') : value
        return [key, value_] as [keyof RequestBody, RequestBody[typeof key]]
      }),
    )
    console.log(2, verification$2)

    // Step 2b - Sort all the parameters in alphabetical order, skip the signature parameter
    const verification$3 = whenNotError(verification$2, (res) =>
      res
        .filter(([key]) => key !== 'signature')
        .sort(([a], [b]) => (a > b ? 0 : -1)),
    )
    console.log(3, verification$3)

    // Step 3 - Construct an input string using <parameter name>=<value> format
    // and appending the POP_SERVER_KEY preceded by ':'.
    // Use "true" or "false" string as value for boolean parameter(s).
    const verification$4 = whenNotError(
      verification$3,
      (res) =>
        `${res.reduce(
          (x, [k, v]) => `${x && `${x}&`}${k}=${v}`,
          '',
        )}:${POP_SERVER_KEY}`,
    )
    console.log(4, '*** (SECRET)')

    // Step 4 - Derive the signature using SHA512 hash function
    const verification$5 = await whenNotError(verification$4, (res) =>
      sha512(res),
    )
    console.log(5, verification$5)

    const verify = whenNotErrorAll(
      [verification$1, verification$5],
      ([{ signature }, expected]) =>
        signature === expected
          ? true
          : new Error('Signature verification failed.'),
    )
    console.log(6, verify)

    const client = await whenNotError(
      createClient({
        url: process.env.REDIS_URL,
        username: process.env.REDIS_USERNAME ?? '',
        password: process.env.REDIS_PASSWORD ?? '',
      }),
      (db) =>
        db
          .connect()
          .then(() => db)
          .catch((err) => new Error(err)),
    )

    const paramsFromDb = await whenNotErrorAll(
      [client, verification$1],
      ([db, { order_id }]) => db.get(generateFulFillmentParamsId(order_id)),
    )

    const paramsSaved = whenNotError(
      paramsFromDb,
      (p) =>
        whenDefined(p, (x) => x) ?? new Error('Required params is not defined'),
    )

    const params = whenNotError(paramsSaved, (p) =>
      tryCatch(
        (v) => AbiCoder.defaultAbiCoder().decode(abi, v).map(String),
        (err: Error) => new Error(err.message ?? err),
      )(p),
    )
    console.log(7, params)

    const result$1 = await whenNotError(
      params,
      ([to, property, payload, token, input, gatewayAddress, fee]) =>
        fetch(
          'https://send.devprotocol.xyz/api/send-transactions/SwapTokensAndStakeDev',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${SEND_DEVPROTOCOL_API_KEY}`,
            },
            body: JSON.stringify({
              rpcUrl,
              chainId,
              args: {
                to,
                property,
                payload,
                gatewayAddress,
                amounts: {
                  token,
                  input,
                  fee,
                },
              },
            }),
          },
        ).catch((err) => new Error(err)),
    )
    console.log(8, result$1)

    const result$2 = whenNotError(result$1, (res) =>
      res.ok ? true : new Error('Failed to send blockchain transaction.'),
    )

    const requestBodyWithoutSignature = whenNotError(verification$1, (res) => ({
      ...res,
      signature: undefined,
    }))

    const final = await whenNotErrorAll(
      [result$2, params, requestBodyWithoutSignature],
      ([res, [account], paymentGateway]) =>
        whenDefined(webhookOnFulfillment, (base) =>
          res
            ? fetchWebhook(
                createRequest({
                  base,
                  status: Status.Success,
                  account,
                  paymentGateway,
                }),
              ).catch((err) => new Error(err))
            : res,
        ),
    )
    console.log(9, final)

    return final instanceof Error
      ? new Response(
          JSON.stringify({ message: 'error', error: final.message }),
          {
            status: result$2 instanceof Error ? 400 : 200,
            headers,
          },
        )
      : new Response(JSON.stringify({ message: 'success' }), {
          status: 200,
          headers,
        })
  }

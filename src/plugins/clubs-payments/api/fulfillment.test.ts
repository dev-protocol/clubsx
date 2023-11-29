import { expect, describe, it, vi, afterEach, type Mock } from 'vitest'
import { abi, post, type RequestBody } from './fulfillment'
import type { APIContext } from 'astro'
import { toPairs } from 'ramda'
import redis from 'redis'
import fetch from 'cross-fetch'
import jsonwebtoken from 'jsonwebtoken'
import { AbiCoder, ZeroAddress, randomBytes } from 'ethers'
import { bytes32Hex } from '@devprotocol/clubs-core'
import { generateFulFillmentParamsId } from '../utils/gen-key'
import { sha512 } from 'crypto-hash'
import { Status, createRequestBody } from '../utils/webhooks'
import type { PartialDeep } from 'type-fest'

const redisData = new Map()
const POP_SERVER_KEY = '!@#'
const SEND_DEVPROTOCOL_API_KEY = '$%^'
const SALT = '^&*'
const WILL_BE_ERROR = 'will_be_error'

vi.mock('redis', async () => {
  const actual: typeof redis = await vi.importActual('redis')
  const lib = vi.fn(() => ({
    connect: vi.fn(async () => null),
    get: vi.fn(async (k) => redisData.get(k)),
    set: vi.fn(async (k, v) => redisData.set(k, v)),
    quit: vi.fn(),
  }))

  return { ...actual, default: actual, createClient: lib }
})
vi.mock('cross-fetch', () => {
  const lib = vi.fn(async (url: string, opts?: RequestInit) => {
    return url.includes(WILL_BE_ERROR) ||
      opts?.body?.toString().includes(WILL_BE_ERROR)
      ? Promise.reject(new Error('ERROR'))
      : { ok: true }
  })
  return { default: lib }
})
vi.stubEnv('POP_SERVER_KEY', POP_SERVER_KEY)
vi.stubEnv('SEND_DEVPROTOCOL_API_KEY', SEND_DEVPROTOCOL_API_KEY)
vi.stubEnv('SALT', SALT)

const createBody = async ({
  merchant_id = '.',
  order_id = '@',
  status = 'success',
  result_code = '#',
  m_status = 'success',
  v_result_code = '$',
  transaction_datetime = '%',
  dummy = false,
  payment_type = 'card',
  acquirer_code = '^',
  auth_code = '*',
  masked_card_number = '(',
}: PartialDeep<Omit<RequestBody, 'signature'>> = {}) => {
  const data: Omit<RequestBody, 'signature'> = {
    merchant_id,
    order_id,
    status,
    result_code,
    m_status,
    v_result_code,
    transaction_datetime,
    dummy,
    payment_type,
    acquirer_code,
    auth_code,
    masked_card_number,
  }
  const body: RequestBody = {
    ...data,
    signature: await ((d) => {
      const x = toPairs(d)
        .map((kv) => {
          const [key, value] = kv as NonNullable<typeof kv>
          const value_ = Array.isArray(value) ? value.join(',') : value
          return [key, value_] as [keyof RequestBody, RequestBody[typeof key]]
        })
        .sort(([a], [b]) => (a > b ? 0 : -1))
      const y = `${x.reduce(
        (x, [k, v]) => `${x && `${x}&`}${k}=${v}`,
        '',
      )}:${POP_SERVER_KEY}`
      return sha512(y)
    })(data),
  }
  return body
}

describe('post returns APIRoute function', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('this always returns Response', async () => {
    const handler = post({ chainId: 137, rpcUrl: 'https://polygon-rpc.com' })
    const res = await handler({
      request: new Request('http://example.com'),
    } as APIContext)
    expect(res).toBeInstanceOf(Response)
  })
})

describe('post returns {message: success} when it received a normal input', async () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  const body = await createBody()
  const params = [
    ZeroAddress,
    ZeroAddress,
    bytes32Hex(randomBytes(1)),
    ZeroAddress,
    '1',
    ZeroAddress,
    '0',
  ]
  redisData.set(
    generateFulFillmentParamsId(body.order_id),
    AbiCoder.defaultAbiCoder().encode(abi, params),
  )

  describe('without `webhookOnFulfillment` option', () => {
    it('should return success', async () => {
      const handler = post({ chainId: 137, rpcUrl: 'https://polygon-rpc.com' })
      const res = await handler({
        request: new Request('http://foo', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      } as APIContext)
      expect(res).toBeInstanceOf(Response)
      expect(await (res as Response).json()).toEqual({ message: 'success' })
    })

    it('should return Response as 200', async () => {
      const handler = post({ chainId: 137, rpcUrl: 'https://polygon-rpc.com' })
      const res = await handler({
        request: new Request('http://foo', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      } as APIContext)
      expect(res).toBeInstanceOf(Response)
      expect((res as Response).status).toEqual(200)
    })

    it('should call send.devprotocol.xyz', async () => {
      const handler = post({ chainId: 137, rpcUrl: 'https://polygon-rpc.com' })
      await handler({
        request: new Request('http://foo', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      } as APIContext)

      expect(fetch).toHaveBeenCalledTimes(1)
      expect(fetch).toHaveBeenCalledWith(
        'https://send.devprotocol.xyz/api/send-transactions/SwapTokensAndStakeDev',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${SEND_DEVPROTOCOL_API_KEY}`,
          },
          body: JSON.stringify({
            requestId: body.order_id,
            rpcUrl: 'https://polygon-rpc.com',
            chainId: 137,
            args: {
              to: params[0],
              property: params[1],
              payload: params[2],
              gatewayAddress: params[5],
              amounts: {
                token: params[3],
                input: params[4],
                fee: params[6],
              },
            },
          }),
        },
      )
    })
  })

  describe('with `webhookOnFulfillment` option', () => {
    const url = 'http://webhooks'
    const webhookOnFulfillment = jsonwebtoken.sign(url, SALT)

    it('should return success', async () => {
      const handler = post({
        chainId: 137,
        rpcUrl: 'https://polygon-rpc.com',
        webhookOnFulfillment,
      })
      const res = await handler({
        request: new Request('http://foo', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      } as APIContext)
      expect(res).toBeInstanceOf(Response)
      expect(await (res as Response).json()).toEqual({ message: 'success' })
    })

    it('should return Response 200', async () => {
      const handler = post({
        chainId: 137,
        rpcUrl: 'https://polygon-rpc.com',
        webhookOnFulfillment,
      })
      const res = await handler({
        request: new Request('http://foo', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      } as APIContext)
      expect(res).toBeInstanceOf(Response)
      expect((res as Response).status).toEqual(200)
    })

    it('should call send.devprotocol.xyz', async () => {
      const handler = post({
        chainId: 137,
        rpcUrl: 'https://polygon-rpc.com',
        webhookOnFulfillment,
      })
      await handler({
        request: new Request('http://foo', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      } as APIContext)

      expect(fetch).toHaveBeenCalledTimes(2)
      expect(fetch).toHaveBeenNthCalledWith(
        1,
        'https://send.devprotocol.xyz/api/send-transactions/SwapTokensAndStakeDev',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${SEND_DEVPROTOCOL_API_KEY}`,
          },
          body: JSON.stringify({
            requestId: body.order_id,
            rpcUrl: 'https://polygon-rpc.com',
            chainId: 137,
            args: {
              to: params[0],
              property: params[1],
              payload: params[2],
              gatewayAddress: params[5],
              amounts: {
                token: params[3],
                input: params[4],
                fee: params[6],
              },
            },
          }),
        },
      )
    })

    it('should call the passed webhook url', async () => {
      const handler = post({
        chainId: 137,
        rpcUrl: 'https://polygon-rpc.com',
        webhookOnFulfillment,
      })
      await handler({
        request: new Request('http://foo', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      } as APIContext)

      const withoutSignature = (({ signature, ...vi }) => ({ ...vi }))(body)
      expect(fetch).toHaveBeenCalledTimes(2)
      expect(fetch).toHaveBeenNthCalledWith(2, url, {
        method: 'POST',
        body: createRequestBody({
          status: Status.Success,
          account: params[0],
          paymentGateway: withoutSignature,
        }),
        headers: {
          'content-type': 'application/json;charset=UTF-8',
        },
      })
    })

    it('should return Response 200 even calling webhook failed', async () => {
      const handler = post({
        chainId: 137,
        rpcUrl: 'https://polygon-rpc.com',
        webhookOnFulfillment: jsonwebtoken.sign(
          `${url}?${WILL_BE_ERROR}`,
          SALT,
        ),
      })
      const res = await handler({
        request: new Request('http://foo', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      } as APIContext)

      expect((fetch as Mock).mock.results[1]).toEqual({
        type: 'throw',
        value: new Error('ERROR'),
      })
      expect((res as Response).status).toEqual(200)
      expect(await (res as Response).json()).toEqual({
        message: 'error',
        error: 'Error: ERROR',
      })
    })

    it('should not call webhook if decrypting webhook url failed', async () => {
      const handler = post({
        chainId: 137,
        rpcUrl: 'https://polygon-rpc.com',
        webhookOnFulfillment: jsonwebtoken.sign(url, '_WRONG_SALT_'),
      })
      const res = await handler({
        request: new Request('http://foo', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      } as APIContext)

      expect(fetch).toHaveBeenCalledTimes(1)
      expect((fetch as Mock).mock.calls[0][0]).not.toBe(url)
      expect((res as Response).status).toEqual(200)
    })

    it('should not call webhook if calling send.devprotocol.xyz failed', async () => {
      redisData.set(
        generateFulFillmentParamsId(WILL_BE_ERROR),
        AbiCoder.defaultAbiCoder().encode(abi, params),
      )
      const handler = post({
        chainId: 137,
        rpcUrl: 'https://polygon-rpc.com',
        webhookOnFulfillment,
      })
      const res = await handler({
        request: new Request('http://foo', {
          method: 'POST',
          body: JSON.stringify(await createBody({ order_id: WILL_BE_ERROR })),
        }),
      } as APIContext)

      expect(fetch).toHaveBeenCalledTimes(1)
      expect((fetch as Mock).mock.calls[0][0]).not.toBe(url)
      expect((fetch as Mock).mock.results[0]).toEqual({
        type: 'throw',
        value: new Error('ERROR'),
      })
      expect((res as Response).status).toEqual(200)
    })

    it('should not call webhook if decording tx params failed', async () => {
      const order_id = '_123_'
      redisData.set(
        generateFulFillmentParamsId(order_id),
        AbiCoder.defaultAbiCoder().encode(['uint256'], ['1']), // Set wrong value
      )

      const handler = post({
        chainId: 137,
        rpcUrl: 'https://polygon-rpc.com',
        webhookOnFulfillment,
      })
      const res = await handler({
        request: new Request('http://foo', {
          method: 'POST',
          body: JSON.stringify(await createBody({ order_id })),
        }),
      } as APIContext)

      const json = await (res as Response).json()
      expect(fetch).toHaveBeenCalledTimes(0)
      expect((res as Response).status).toEqual(200)
      expect(json.message).toEqual('error')
      expect(json.error).toContain('data out-of-bounds')
    })

    it('should not call webhook if `status` in body is success', async () => {
      const handler = post({
        chainId: 137,
        rpcUrl: 'https://polygon-rpc.com',
        webhookOnFulfillment,
      })
      const res = await handler({
        request: new Request('http://foo', {
          method: 'POST',
          body: JSON.stringify(await createBody({ status: 'failure' })),
        }),
      } as APIContext)

      const json = await (res as Response).json()
      expect(fetch).toHaveBeenCalledTimes(0)
      expect((res as Response).status).toEqual(200)
      expect(json).toEqual({
        message: 'error',
        error: 'Transaction must be success',
      })
    })

    it('should not call webhook if `m_status` in body is not success (failure)', async () => {
      const handler = post({
        chainId: 137,
        rpcUrl: 'https://polygon-rpc.com',
        webhookOnFulfillment,
      })
      const res = await handler({
        request: new Request('http://foo', {
          method: 'POST',
          body: JSON.stringify(await createBody({ m_status: 'failure' })),
        }),
      } as APIContext)

      const json = await (res as Response).json()
      expect(fetch).toHaveBeenCalledTimes(0)
      expect((res as Response).status).toEqual(200)
      expect(json).toEqual({
        message: 'error',
        error: 'Transaction must be success',
      })
    })

    it('should not call webhook if `m_status` in body is not success (pending)', async () => {
      const handler = post({
        chainId: 137,
        rpcUrl: 'https://polygon-rpc.com',
        webhookOnFulfillment,
      })
      const res = await handler({
        request: new Request('http://foo', {
          method: 'POST',
          body: JSON.stringify(await createBody({ m_status: 'pending' })),
        }),
      } as APIContext)

      const json = await (res as Response).json()
      expect(fetch).toHaveBeenCalledTimes(0)
      expect((res as Response).status).toEqual(200)
      expect(json).toEqual({
        message: 'error',
        error: 'Transaction must be success',
      })
    })
  })
})

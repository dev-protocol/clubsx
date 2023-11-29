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
import { beforeEach } from 'node:test'

const redisData = new Map()
const POP_SERVER_KEY = '!@#'
const REDIS_URL = '&*('
const SEND_DEVPROTOCOL_API_KEY = '$%^'
const SALT = '^&*'
const WILL_BE_ERROR = 'will_be_error'
const WILL_BE_FAILED_TO_FETCH = 'will_be_failed_to_fetch'

enum MockUses {
  Default = 'default',
  Error = 'error',
}

const redisConnectMocks: Map<MockUses, () => Promise<any>> = new Map([
  [
    MockUses.Default,
    async () => {
      return null
    },
  ],
  [
    MockUses.Error,
    async () => {
      throw new Error('REDIS ERROR')
    },
  ],
])
let redisConnectUses: MockUses = MockUses.Default

vi.mock('redis', async () => {
  const actual: typeof redis = await vi.importActual('redis')
  const lib = vi.fn(() => ({
    connect: vi.fn(() => redisConnectMocks.get(redisConnectUses)?.()),
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
      : url.includes(WILL_BE_FAILED_TO_FETCH) ||
          opts?.body?.toString().includes(WILL_BE_FAILED_TO_FETCH)
        ? { ok: false }
        : { ok: true }
  })
  return { default: lib }
})
vi.stubEnv('POP_SERVER_KEY', POP_SERVER_KEY)
vi.stubEnv('REDIS_URL', REDIS_URL)
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
  })
})

describe('post returns {message: error} when it received an invalid input', async () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('without `webhookOnFulfillment` option', () => {
    describe('should return error if parsing body is failed', () => {
      const body = null

      it('returns error', async () => {
        const handler = post({
          chainId: 137,
          rpcUrl: 'https://polygon-rpc.com',
        })
        const res = await handler({
          request: new Request('http://foo', {
            method: 'POST',
            body,
          }),
        } as APIContext)

        expect(res).toBeInstanceOf(Response)
        expect(await (res as Response).json()).toEqual({
          message: 'error',
          error: 'SyntaxError: Unexpected end of JSON input',
        })
      })

      it('should not call any external API', async () => {
        const handler = post({
          chainId: 137,
          rpcUrl: 'https://polygon-rpc.com',
        })
        await handler({
          request: new Request('http://foo', {
            method: 'POST',
            body,
          }),
        } as APIContext)

        expect(fetch).toHaveBeenCalledTimes(0)
      })
    })

    describe('should return error if `status` in body is not success', async () => {
      const body = JSON.stringify(await createBody({ status: 'failure' }))

      it('returns error', async () => {
        const handler = post({
          chainId: 137,
          rpcUrl: 'https://polygon-rpc.com',
        })
        const res = await handler({
          request: new Request('http://foo', {
            method: 'POST',
            body,
          }),
        } as APIContext)

        expect(res).toBeInstanceOf(Response)
        expect(await (res as Response).json()).toEqual({
          message: 'error',
          error: 'Transaction must be success',
        })
      })

      it('should not call any external API', async () => {
        const handler = post({
          chainId: 137,
          rpcUrl: 'https://polygon-rpc.com',
        })
        await handler({
          request: new Request('http://foo', {
            method: 'POST',
            body,
          }),
        } as APIContext)

        expect(fetch).toHaveBeenCalledTimes(0)
      })
    })

    describe('should return error if `m_status` in body is not success (failure)', async () => {
      const body = JSON.stringify(await createBody({ m_status: 'failure' }))

      it('returns error', async () => {
        const handler = post({
          chainId: 137,
          rpcUrl: 'https://polygon-rpc.com',
        })
        const res = await handler({
          request: new Request('http://foo', {
            method: 'POST',
            body,
          }),
        } as APIContext)

        expect(res).toBeInstanceOf(Response)
        expect(await (res as Response).json()).toEqual({
          message: 'error',
          error: 'Transaction must be success',
        })
      })

      it('should not call any external API', async () => {
        const handler = post({
          chainId: 137,
          rpcUrl: 'https://polygon-rpc.com',
        })
        await handler({
          request: new Request('http://foo', {
            method: 'POST',
            body,
          }),
        } as APIContext)

        expect(fetch).toHaveBeenCalledTimes(0)
      })
    })

    describe('should return error if `m_status` in body is not success (pending)', async () => {
      const body = JSON.stringify(await createBody({ m_status: 'pending' }))

      it('returns error', async () => {
        const handler = post({
          chainId: 137,
          rpcUrl: 'https://polygon-rpc.com',
        })
        const res = await handler({
          request: new Request('http://foo', {
            method: 'POST',
            body,
          }),
        } as APIContext)

        expect(res).toBeInstanceOf(Response)
        expect(await (res as Response).json()).toEqual({
          message: 'error',
          error: 'Transaction must be success',
        })
      })

      it('should not call any external API', async () => {
        const handler = post({
          chainId: 137,
          rpcUrl: 'https://polygon-rpc.com',
        })
        await handler({
          request: new Request('http://foo', {
            method: 'POST',
            body,
          }),
        } as APIContext)

        expect(fetch).toHaveBeenCalledTimes(0)
      })
    })

    describe('should return error if `signature` in body is not match to calculated value', async () => {
      const body = JSON.stringify({
        ...(await createBody()),
        signature: '_wrong_value_',
      })

      it('returns error', async () => {
        const handler = post({
          chainId: 137,
          rpcUrl: 'https://polygon-rpc.com',
        })
        const res = await handler({
          request: new Request('http://foo', {
            method: 'POST',
            body,
          }),
        } as APIContext)

        expect(fetch).toHaveBeenCalledTimes(0)
        expect(res).toBeInstanceOf(Response)
        expect(await (res as Response).json()).toEqual({
          message: 'error',
          error: 'Verification failed.',
        })
      })

      it('should not call any external API', async () => {
        const handler = post({
          chainId: 137,
          rpcUrl: 'https://polygon-rpc.com',
        })
        await handler({
          request: new Request('http://foo', {
            method: 'POST',
            body,
          }),
        } as APIContext)

        expect(fetch).toHaveBeenCalledTimes(0)
      })
    })

    describe('should return error if creating redis failed', async () => {
      const body = JSON.stringify(await createBody())

      afterEach(() => {
        redisConnectUses = MockUses.Default
      })

      it('returns error', async () => {
        redisConnectUses = MockUses.Error

        const handler = post({
          chainId: 137,
          rpcUrl: 'https://polygon-rpc.com',
        })
        const res = await handler({
          request: new Request('http://foo', {
            method: 'POST',
            body,
          }),
        } as APIContext)

        expect(res).toBeInstanceOf(Response)
        expect(await (res as Response).json()).toEqual({
          message: 'error',
          error: 'Error: REDIS ERROR',
        })
      })

      it('should not call any external API', async () => {
        redisConnectUses = MockUses.Error

        const handler = post({
          chainId: 137,
          rpcUrl: 'https://polygon-rpc.com',
        })
        await handler({
          request: new Request('http://foo', {
            method: 'POST',
            body,
          }),
        } as APIContext)

        expect(fetch).toHaveBeenCalledTimes(0)
      })
    })

    describe('should return error if fetching stored tx params failed', async () => {
      const order_id = '_random_'
      redisData.delete(generateFulFillmentParamsId(order_id))
      const body = JSON.stringify(await createBody({ order_id }))

      it('returns error', async () => {
        const handler = post({
          chainId: 137,
          rpcUrl: 'https://polygon-rpc.com',
        })
        const res = await handler({
          request: new Request('http://foo', {
            method: 'POST',
            body,
          }),
        } as APIContext)

        expect(res).toBeInstanceOf(Response)
        expect(await (res as Response).json()).toEqual({
          message: 'error',
          error: 'Required params is not defined',
        })
      })

      it('should not call any external API', async () => {
        const handler = post({
          chainId: 137,
          rpcUrl: 'https://polygon-rpc.com',
        })
        await handler({
          request: new Request('http://foo', {
            method: 'POST',
            body,
          }),
        } as APIContext)

        expect(fetch).toHaveBeenCalledTimes(0)
      })
    })

    describe('should return error if decording tx params failed', async () => {
      const order_id = '_123_'
      redisData.set(
        generateFulFillmentParamsId(order_id),
        AbiCoder.defaultAbiCoder().encode(['uint256'], ['1']), // Set wrong value
      )
      const body = JSON.stringify(await createBody({ order_id }))

      it('returns error', async () => {
        const handler = post({
          chainId: 137,
          rpcUrl: 'https://polygon-rpc.com',
        })
        const res = await handler({
          request: new Request('http://foo', {
            method: 'POST',
            body,
          }),
        } as APIContext)

        const json = await (res as Response).json()

        expect((res as Response).status).toEqual(200)
        expect(json.message).toEqual('error')
        expect(json.error).toContain('data out-of-bounds')
      })

      it('should not call any external API', async () => {
        const handler = post({
          chainId: 137,
          rpcUrl: 'https://polygon-rpc.com',
        })
        await handler({
          request: new Request('http://foo', {
            method: 'POST',
            body,
          }),
        } as APIContext)

        expect(fetch).toHaveBeenCalledTimes(0)
      })
    })

    describe('should return error if calling send.devprotocol.xyz failed', async () => {
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
        generateFulFillmentParamsId(WILL_BE_FAILED_TO_FETCH),
        AbiCoder.defaultAbiCoder().encode(abi, params),
      )
      const body = JSON.stringify(
        await createBody({ order_id: WILL_BE_FAILED_TO_FETCH }),
      )

      it('returns error', async () => {
        const handler = post({
          chainId: 137,
          rpcUrl: 'https://polygon-rpc.com',
        })
        const res = await handler({
          request: new Request('http://foo', {
            method: 'POST',
            body,
          }),
        } as APIContext)

        expect(res).toBeInstanceOf(Response)
        expect(await (res as Response).json()).toEqual({
          message: 'error',
          error: 'Failed to send blockchain transaction.',
        })
      })

      it('should call only send.devprotocol.xyz', async () => {
        const handler = post({
          chainId: 137,
          rpcUrl: 'https://polygon-rpc.com',
        })
        await handler({
          request: new Request('http://foo', {
            method: 'POST',
            body,
          }),
        } as APIContext)

        expect(fetch).toHaveBeenCalledTimes(1)
        expect((fetch as Mock).mock.calls[0][0]).toBe(
          'https://send.devprotocol.xyz/api/send-transactions/SwapTokensAndStakeDev',
        )
      })
    })
  })

  describe('with `webhookOnFulfillment` option', () => {
    describe('should return error if calling webhook failed', () => {
      it('returns error', async () => {
        const handler = post({
          chainId: 137,
          rpcUrl: 'https://polygon-rpc.com',
          webhookOnFulfillment: jsonwebtoken.sign(
            `http://webhooks?${WILL_BE_ERROR}`,
            SALT,
          ),
        })
        const res = await handler({
          request: new Request('http://foo', {
            method: 'POST',
            body: JSON.stringify(await createBody()),
          }),
        } as APIContext)

        expect(fetch).toHaveBeenCalledTimes(2)
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
    })

    describe('should return error if decrypting webhook url failed', async () => {
      const url = 'http://webhooks'
      const body = JSON.stringify(await createBody())
      const webhookOnFulfillment = jsonwebtoken.sign(url, '_WRONG_SALT_')

      const handler = post({
        chainId: 137,
        rpcUrl: 'https://polygon-rpc.com',
        webhookOnFulfillment,
      })

      it('returns error', async () => {
        const res = await handler({
          request: new Request('http://foo', {
            method: 'POST',
            body,
          }),
        } as APIContext)

        expect((fetch as Mock).mock.calls[0][0]).not.toBe(url)
        expect(await (res as Response).json()).toEqual({
          message: 'error',
          error: 'invalid signature',
        })
      })

      it('should call only send.devprotocol.xyz', async () => {
        await handler({
          request: new Request('http://foo', {
            method: 'POST',
            body,
          }),
        } as APIContext)

        expect(fetch).toHaveBeenCalledTimes(1)
        expect((fetch as Mock).mock.calls[0][0]).toBe(
          'https://send.devprotocol.xyz/api/send-transactions/SwapTokensAndStakeDev',
        )
      })
    })
  })
})

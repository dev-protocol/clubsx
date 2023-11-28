import { expect, describe, it } from 'vitest'
import { post } from './fulfillment'
import type { APIContext } from 'astro'

describe('post', () => {
  it('post returns APIRoute function', async () => {
    const handler = post({ chainId: 137, rpcUrl: 'https://polygon-rpc.com' })
    const res = await handler({
      request: new Request('http://example.com'),
    } as APIContext)
    expect(res).toBeInstanceOf(Response)
  })
})

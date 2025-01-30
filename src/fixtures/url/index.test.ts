/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect, describe, it, vi, afterEach } from 'vitest'
import { replaceUrlConfigWithLocal } from '.'
import type { ClubsConfiguration } from '@devprotocol/clubs-core'

vi.stubEnv('HOSTS', 'clubs.place, prerelease.clubs.place')

const run = (configUrl: string) => {
  it('returns config having `https://xxx.clubs.place` when request is to `https://xxx.clubs.place`', async () => {
    const res = replaceUrlConfigWithLocal(
      {
        url: configUrl,
      } as ClubsConfiguration,
      new URL('https://xxx.clubs.place/sites_/xxx'), // the middleware generates this url
      'xxx',
    )
    expect(res.url).toBe('https://xxx.clubs.place')
  })

  it('returns config having `https://clubs.place/xxx` when request is to `https://clubs.place/xxx`', async () => {
    const res = replaceUrlConfigWithLocal(
      {
        url: configUrl,
      } as ClubsConfiguration,
      new URL('https://clubs.place/xxx'),
      'xxx',
    )
    expect(res.url).toBe('https://clubs.place/xxx')
  })

  it('returns config having `https://xxx.hoo.clubs.place/xxx` when request is to `https://xxx.hoo.clubs.place`', async () => {
    const res = replaceUrlConfigWithLocal(
      {
        url: configUrl,
      } as ClubsConfiguration,
      new URL('https://xxx.hoo.clubs.place/sites_/xxx'), // the middleware generates this url
      'xxx',
    )
    expect(res.url).toBe('https://xxx.hoo.clubs.place')
  })

  it('returns config having `https://hoo.clubs.place/xxx` when request is to `https://hoo.clubs.place/xxx`', async () => {
    const res = replaceUrlConfigWithLocal(
      {
        url: configUrl,
      } as ClubsConfiguration,
      new URL('https://hoo.clubs.place/xxx'),
      'xxx',
    )
    expect(res.url).toBe('https://hoo.clubs.place/xxx')
  })
}

describe('replaceUrlConfigWithLocal', () => {
  describe('subdomain-type config', () => {
    const CONFIG_URL = 'https://xxx.clubs.place'

    run(CONFIG_URL)
  })

  describe('subdirectory-type config', () => {
    const CONFIG_URL = 'https://clubs.place/xxx'

    run(CONFIG_URL)
  })
})

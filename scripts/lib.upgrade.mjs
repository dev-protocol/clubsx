import { createClient } from 'redis'
import dotenv from 'dotenv'
import { decode, encode } from '@devprotocol/clubs-core'

dotenv.config()

/**
 * @param {(config: import('@devprotocol/clubs-core').ClubsConfiguration) => import('@devprotocol/clubs-core').ClubsConfiguration} impl
 * @param {string} key
 */
export const upgrade = async (impl, key) => {
  try {
    const client = createClient({
      url: process.env.REDIS_URL,
      username: process.env.REDIS_USERNAME ?? '',
      password: process.env.REDIS_PASSWORD ?? '',
    })
    await client.connect()

    const encodedConfig = await client.get(key)
    const upgradedConfig = impl(decode(encodedConfig))
    const nextConfig = encode(upgradedConfig)

    if (encodedConfig === nextConfig) {
      console.log('Up-to-date', key)
    } else {
      await client.set(key, nextConfig)
      console.log('Upgraded:', key)
      console.log('DB Upgraded')
    }

    await client.quit()
    console.log('Closed the DB connection')
  } catch (error) {
    console.error('error upgrading db: ', error)
  }
}
